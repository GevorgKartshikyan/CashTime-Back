import path from 'path';
import fs from 'fs';
import HttpError from 'http-errors';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { v4 as uuidV4 } from 'uuid';
import Users from '../models/Users';
import Mail from '../services/Mail';

const { JWT_SECRET } = process.env;

class UsersController {
  static register = async (req, res, next) => {
    try {
      const {
        email, password, firstName, lastName, phone,
      } = req.body;
      const { file } = req;
      console.log(file);
      if (!email) {
        throw HttpError(400, 'Email is required');
      }

      if (!firstName) {
        throw HttpError(400, 'Firstname is required');
      }

      if (!lastName) {
        throw HttpError(400, 'Lastname is required');
      }

      if (!password) {
        throw HttpError(400, 'Password is required');
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
          throw HttpError(422, {
            errors: {
              email: 'This email is already registered',
            },
          });
        }
      }

      const role = 'employer';
      const location = {
        type: 'Point',
        coordinates: [39.807222, -76.984722],
      };

      const validationCode = _.random(1000, 9999);

      await Mail.send(email, 'Account Activation', 'userActivation', {
        email,
        firstName,
        lastName,
        validationCode,
      });

      let avatar;
      if (file) {
        avatar = path.join(`/images/users/${uuidV4()}_${file.originalname}`);
        const filePath = path.resolve(path.join('public', avatar));
        fs.writeFileSync(filePath, file.buffer);
      }

      const user = await Users.create({
        email,
        firstName,
        lastName,
        location,
        phone,
        password,
        role,
        validationCode,
        status: 'pending',
        avatar,
      });
      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({
        where: {
          email,
          password: Users.passwordHash(password),
        },
      });
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
}

export default UsersController;
