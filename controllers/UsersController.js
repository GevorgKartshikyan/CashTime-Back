import path from 'path';
import fs from 'fs';
import HttpError from 'http-errors';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { v4 as uuidV4 } from 'uuid';
import { Sequelize } from 'sequelize';
import {
  Users, Cvs, Reports, Messages,
} from '../models/index';
import Mail from '../services/Mail';

const { JWT_SECRET } = process.env;

class UsersController {
  static register = async (req, res, next) => {
    try {
      const { file } = req;
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        role = 'employer',
        address,
        confirmPassword,
        type,
      } = req.body;
      console.log(req.body, 'body');
      let location = null;
      let city = null;
      let country = null;
      if (!type) {
        if (address.latitude && address.longitude && address) {
          location = {
            type: 'Point',
            coordinates: [address.longitude, address.latitude],
          };
          city = address.city;
          country = address.country;
        }
      }
      if (!email && !type) {
        throw HttpError(400, 'Email is required');
      }
      if (!firstName && !type) {
        throw HttpError(400, 'Firstname is required');
      }

      if (!lastName && !type) {
        throw HttpError(400, 'Lastname is required');
      }

      if (!password && !type) {
        throw HttpError(400, 'Password is required');
      }

      if (!confirmPassword && !type) {
        throw HttpError(400, 'Confirm password');
      }

      if (password !== confirmPassword && !type) {
        throw HttpError(400, 'Password is different');
      }
      const exists = await Users.findOne({
        attributes: ['id', 'status'],
        where: {
          email,
        },
      });
      if (exists) {
        if (exists.status === 'pending') {
          await exists.destroy();
        } else {
          throw HttpError(400, 'This email is already registered');
        }
      }

      const validationCode = _.random(1000, 9999);

      if (!type) {
        await Mail.send(email, 'Account Activation', 'userActivation', {
          email,
          firstName,
          lastName,
          validationCode,
        });
      }

      let avatar;
      if (file) {
        avatar = path.join(`/images/users/${uuidV4()}_${file.originalname}`);
        const filePath = path.resolve(path.join('public', avatar));
        fs.writeFileSync(filePath, file.buffer);
      } else {
        avatar = path.join('/images/users/default-avatar-icon.jpg');
      }
      const user = await Users.create({
        email,
        firstName,
        lastName,
        location,
        city,
        country,
        phone,
        password,
        role,
        validationCode,
        status: type ? 'active' : 'pending',
        avatar,
      });
      let token;
      if (type) {
        token = jwt.sign({ userId: user.id }, JWT_SECRET);
      }
      res.json({
        status: 'ok',
        user,
        token,
      });
    } catch (e) {
      next(e);
    }
  };

  static login = async (req, res, next) => {
    try {
      const {
        email,
        password,
        type,
      } = req.body;

      let user;

      if (!type) {
        user = await Users.findOne({
          where: {
            email,
            password: Users.passwordHash(password),
            status: 'active',
          },
        });
      } else {
        user = await Users.findOne({
          where: {
            email,
          },
        });
      }

      if (!user) {
        throw HttpError(403, 'Invalid email or password');
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      res.json({
        status: 'ok',
        user,
        token,
      });
    } catch (e) {
      next(e);
    }
  };

  static activate = async (req, res, next) => {
    try {
      const {
        validationCode,
        email,
      } = req.body;
      const user = await Users.findOne({
        where: {
          email,
          validationCode,
          status: 'pending',
        },
      });
      if (!user) {
        throw HttpError(403, 'Invalid activation code');
      }
      user.status = 'active';
      user.validationCode = null;
      await user.save();
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      res.json({
        status: 'ok',
        user,
        token,
      });
    } catch (e) {
      next(e);
    }
  };

  static resetPassword = async (req, res, next) => {
    try {
      const { userId } = req;
      const { userEmail } = req.body;

      let user;

      if (userId) {
        user = await Users.findOne({
          where: {
            id: userId,
          },
        });
      } else {
        user = await Users.findOne({
          where: {
            email: userEmail,
          },
        });
      }

      if (!user) {
        throw HttpError(401, 'Wrong email');
      }

      const { email, firstName, lastName } = user;

      const validationCode = _.random(1000, 9999);

      await Mail.send(email, 'Reset Password', 'userPasswordReset', {
        email,
        firstName,
        lastName,
        validationCode,
      });

      res.json({
        status: 'ok',
        validationCode,
      });
    } catch (e) {
      next(e);
    }
  };

  static resetPasswordConfirm = async (req, res, next) => {
    try {
      const { userId } = req;
      const { newPassword } = req.body;

      const user = await Users.findOne({
        where: {
          id: userId,
        },
      });

      user.password = newPassword;
      await user.save();

      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteProfile = async (req, res, next) => {
    try {
      const { userId } = req;
      const { password } = req.body;

      const user = await Users.findOne({
        where: {
          id: userId,
          password: Users.passwordHash(password),
        },
      });

      if (!user) {
        throw HttpError(401, 'Wrong password');
      }

      user.status = 'deleted';
      await user.save();

      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static list = async (req, res, next) => {
    const { userId } = req;
    try {
      const {
        page = 1,
        limit = 5,
        role,
        search,
        id = undefined,
      } = req.query;
      if (Number.isNaN(+page) || Number.isNaN(+limit)) {
        throw HttpError(400, 'Page or limit is not a number');
      }
      const where = {
        status: {
          $ne: 'pending',
        },
      };
      if (search) {
        where.$or = [
          { firstName: { $like: `%${search}%` } },
          { lastName: { $like: `%${search}%` } },
          { email: { $like: `%${search}%` } },
        ];
      }

      where.role = role;
      const count = await Users.count({
        where,
      });
      const totalPages = Math.ceil(count / limit);
      const offset = (+page - 1) * +limit;
      const usersList = await Users.findAll({
        limit: +limit,
        offset,
        where,
      });

      let currentUser = {};
      if (id) {
        currentUser = await Users.findByPk(id);
        if (currentUser.status === 'active') {
          currentUser.status = 'block';
        } else {
          currentUser.status = 'active';
        }
        await currentUser.save();
      }
      console.log(currentUser, 'user');
      const usersForMessages = await Users.findAll({
        where,
        include: [
          {
            model: Messages,
            as: 'messagesTo',
            attributes: [],
            required: false,
            where: {
              $or: [
                { to: userId },
                { from: userId },
              ],
            },
          },
          {
            model: Messages,
            as: 'messagesFrom',
            attributes: [],
            required: false,
            where: {
              $or: [
                { to: userId },
                { from: userId },
              ],
            },
          },
        ],
        group: ['id'],
        logging: true,
        having: Sequelize.literal('COUNT(`messagesTo`.`id`) > 0 OR COUNT(`messagesFrom`.`id`) > 0'),
        order: [
          [
            Sequelize.literal('GREATEST(COALESCE(max(`messagesTo`.`createdAt`), 0), COALESCE(max(`messagesFrom`.`createdAt`), 0))'),
            'DESC',
          ],
        ],
      });

      // const data = await Messages.findAll({
      //   attributes: [
      //     [Sequelize.literal('ANY_VALUE(text)'), 'text'],
      //     [Sequelize.literal(`ANY_VALUE(IF(\`from\` = ${userId}, \`to\`, \`from\`))`),
      //     'friendId'],
      //   ],
      //   where: {
      //     $or: [
      //       {
      //         to: usersForMessages.map((d) => d.id),
      //         from: userId,
      //       },
      //       {
      //         from: usersForMessages.map((d) => d.id),
      //         to: userId,
      //       },
      //     ],
      //   },
      //   group: [Sequelize.literal(`IF(\`from\` = ${userId} ,
      //   \`from\`, \`to\`), IF(\`from\` = ${userId} , \`to\`, \`from\`)`)],
      //   order: [[Sequelize.literal('MAX(createdAt)'), 'ASC']],
      //   logging: true,
      //   raw: true,
      // });

      const latestMessages = await Messages.findAll({
        attributes: [
          [Sequelize.literal('MAX(createdAt)'), 'latestCreatedAt'],
        ],
        where: {
          $or: [
            {
              to: usersForMessages.map((d) => d.id),
              from: userId,
            },
            {
              from: usersForMessages.map((d) => d.id),
              to: userId,
            },
          ],
        },
        group: [Sequelize.literal(`IF(\`from\` = ${userId} , \`from\`, \`to\`), IF(\`from\` = ${userId} , \`to\`, \`from\`)`)],
        raw: true,
      });

      const latestMessagesIds = await Messages.findAll({
        attributes: ['id'],
        where: {
          createdAt: latestMessages.map((message) => message.latestCreatedAt),
        },
      });

      const latestMessageIdsArray = latestMessagesIds.map((message) => message.id);

      const latestMessagesData = await Messages.findAll({
        where: {
          id: latestMessageIdsArray,
        },
        raw: true,
      });

      usersForMessages.forEach((user) => {
        user.lastMessage = latestMessagesData.find(
          (d) => +d.to === +user.id || +d.from === +user.id,
        );
        user.setDataValue('lastMessage', user.lastMessage);
      });

      res.json({
        status: 'ok',
        totalUsers: count,
        // data,
        totalPages,
        currentPage: +page,
        users: usersList,
        usersForMessages,
      });
    } catch (e) {
      next(e);
    }
  };

  static singleUser = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await Users.findByPk(userId);
      if (!user) {
        throw HttpError(404);
      }
      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static profile = async (req, res, next) => {
    try {
      const { userId } = req;
      console.log(userId, 'aaaaaaaaa');
      const user = await Users.findOne({
        where: {
          id: userId,
        },
        include: [
          {
            model: Cvs,
            as: 'createdCvs',
            required: false,
          },
        ],
        raw: true,
      });

      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static status = async (req, res, next) => {
    try {
      const {
        id,
      } = req.body;
      const user = await Users.findByPk(id);
      if (user.status === 'active') {
        user.status = 'block';
      } else {
        user.status = 'active';
      }
      await user.save();

      console.log(user);

      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static singleUserFromAdmin = async (req, res, next) => {
    try {
      const { id } = req.query;
      console.log(id);
      const singleFromAdmin = await Users.findByPk(id);
      if (!singleFromAdmin) {
        throw HttpError(404);
      }
      res.json({
        status: 'ok',
        singleFromAdmin,
      });
    } catch (e) {
      next(e);
    }
  };

  static changeRole = async (req, res, next) => {
    try {
      const { userId } = req;
      const user = await Users.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw HttpError(404, 'User not found');
      }
      if (user.role === 'employer') {
        user.role = 'employee';
      } else {
        user.role = 'employer';
      }
      await user.save();
      res.json({
        status: 'ok',
        userRole: user.role,
      });
    } catch (e) {
      next(e);
    }
  };

  static blockedUsers = async (req, res, next) => {
    try {
      const blocked = await Users.findAll({
        where: {
          status: 'block',
        },
        include: [
          {
            as: 'report',
            model: Reports,
            required: true,
          },
        ],
        raw: true,
      });
      res.json({
        blocked,
      });
      console.log(blocked);
    } catch (e) {
      next(e);
    }
  };
}

export default UsersController;
