import path from 'path';
import fs from 'fs';
import HttpError from 'http-errors';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { v4 as uuidV4 } from 'uuid';
import { Users, Cvs } from '../models/index';
import Mail from '../services/Mail';

const { JWT_SECRET } = process.env;
class UsersController {
  static register = async (req, res, next) => {
    try {
      const { file } = req;
      const {
        email, password, firstName, lastName, phone, role = 'employer', address, confirmPassword, type,
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
        email, password, type,
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
      const { validationCode, email } = req.body;
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

  static list = async (req, res, next) => {
    try {
      const {
        page = 1, limit = 5, role, search, id = undefined,
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

      let user = {};
      if (id) {
        user = await Users.findByPk(id);
        if (user.status === 'active') {
          user.status = 'block';
        } else {
          user.status = 'active';
        }
        await user.save();
      }
      console.log(user, 'user');
      res.json({
        status: 'ok',
        totalUsers: count,
        totalPages,
        currentPage: +page,
        users: usersList,
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
        raw: false,
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

  static editProfile = async (req, res, next) => {
    try {
      const { userId } = req;
      const { file } = req;
      const data = req.body;
      const user = await Users.findByPk(userId);
      const cv = await Cvs.findOne({
        where: {
          userId,
        },
      });
      if (data.userName) {
        user.firstName = data.userName;
      }
      if (data.surname) {
        user.lastName = data.surname;
      }
      let location = null;
      if (data.address && data.address.longitude && data.address.latitude) {
        location = {
          type: 'Point',
          coordinates: [data.address.longitude, data.address.latitude],
        };
      }
      let avatar;
      if (file) {
        avatar = path.join(`/images/users/${uuidV4()}_${file.originalname}`);
        const filePath = path.resolve(path.join('public', avatar));
        fs.writeFileSync(filePath, file.buffer);
      }
      user.phone = data.phoneNumber;
      user.location = location;
      user.country = data.address.country;
      user.city = data.address.city;
      user.avatar = avatar;
      await user.save();
      if (cv) {
        cv.skills = data.addSkill;
        cv.phoneNumber = data.phoneNumber;
        cv.language = data.addLanguages;
        cv.location = location;
        cv.country = data.address.country;
        cv.city = data.address.city;
        cv.school = data.education;
        cv.degree = data.subject;
        cv.experience = data.profession.label || '';
        await cv.save();
      } else if (!cv) {
        await Cvs.create({
          userId,
          skills: data.addSkill,
          phoneNumber: data.phoneNumber,
          language: data.addLanguages,
          location,
          country: data.address.country,
          city: data.address.city,
          school: data.education,
          degree: data.subject,
          experience: data.profession.label || '',
        });
      }

      res.json({
        user,
        cv,
      });
    } catch (e) {
      next(e);
    }
  };

  static editUserAbout = async (req, res, next) => {
    try {
      const { userId } = req;
      const { data } = req.body;
      const cv = await Cvs.findOne({
        where: {
          userId,
        },
      });
      cv.bio = data.bio;
      await cv.save();
      res.json({
        cv,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default UsersController;
