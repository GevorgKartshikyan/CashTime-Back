import path from 'path';
import fs from 'fs';
import { v4 as uuidV4 } from 'uuid';
import HttpError from 'http-errors';
import { Op } from 'sequelize';
import Cvs from '../models/Cvs';
import Users from '../models/Users';
import { Notification } from '../models/index';

class CvsController {
  static createCv = async (req, res, next) => {
    try {
      const { file, userId } = req;
      const existCv = await Cvs.findOne({
        where: {
          userId,
        },
      });
      if (existCv) {
        throw HttpError(403, 'user already cv');
      }
      const data = req.body;
      const {
        experience,
        goal,
        profRole,
        language,
        school,
        degree,
        datesAttended,
        services,
        hourlyRate,
        skills,
        bio,
        country,
        fullAddress,
        city,
        geometry,
        phoneNumber,
      } = data;
      let cvPhoto;
      if (file) {
        cvPhoto = path.join(`/images/cvs/${uuidV4()}_${file.originalname}`);
        const filePath = path.resolve(path.join('public', cvPhoto));
        fs.writeFileSync(filePath, file.buffer);
      }
      let location = null;
      if (geometry && geometry.longitude && geometry.latitude) {
        location = {
          type: 'Point',
          coordinates: [geometry.longitude, geometry.latitude],
        };
      }
      const cv = await Cvs.create({
        userId,
        experience,
        goal,
        profRole,
        language,
        school,
        degree,
        datesAttended,
        category: services,
        hourlyRate,
        skills: skills || [],
        bio,
        country,
        fullAddress,
        city,
        phoneNumber,
        cvPhoto,
        geometry: location,
      });
      res.json({
        cv,
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };

  static singleCv = async (req, res, next) => {
    try {
      const cvId = req.params.id;
      const cv = await Cvs.findOne({
        where: {
          id: cvId,
        },
      });
      res.json({
        cv,
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };

  static usersData = async (req, res, next) => {
    try {
      const {
        entryLevel, expert, intermediate, hourMin, hourMax, profRole, location,
      } = req.body.data;
      console.log(req.query);
      const { page, limit } = req.query;
      const offset = (page - 1) * limit;
      console.log(limit, offset, 99999999999);
      const { userId } = req;
      const experienceArr = [];
      const where = {};
      if (entryLevel) {
        experienceArr.push('This is My Very First Time');
      }
      if (expert) {
        experienceArr.push('Expert');
      }
      if (intermediate) {
        experienceArr.push('Intermediate');
      }
      const cvWhere = {
        userId: {
          [Op.ne]: userId,
        },
      };
      if (entryLevel || expert || intermediate) {
        cvWhere.experience = { [Op.or]: experienceArr };
      }
      if (hourMin && hourMax) {
        cvWhere.hourlyRate = { $between: [hourMin, hourMax] };
      }
      if (profRole) {
        cvWhere.profRole = { $like: `${profRole}%` };
      }
      if (location) {
        console.log(location);
        where.city = { $like: `${location}%` };
      }
      const userNotices = await Notification.findAll({
        where: {
          noticeFrom: userId,
        },
      });
      if (userNotices) {
        const noShowWorks = userNotices.map((e) => e.noticeTo);
        const uniqId = [...new Set(noShowWorks)];
        where.id = { $notIn: uniqId };
      }
      const users = await Users.findAll({
        where,
        limit: +limit,
        offset,
        include: [
          {
            as: 'createdCvs',
            model: Cvs,
            required: true,
            where: cvWhere,
          },
        ],
        raw: false,
      });
      const count = await Users.count({
        where,
        include: [
          {
            as: 'createdCvs',
            model: Cvs,
            required: true,
            where: cvWhere,
          },
        ],
        raw: false,
      });
      res.json({
        users,
        totalPages: Math.ceil(count / limit),
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };

  static usersDataForMap = async (req, res, next) => {
    try {
      const { city } = req.body;
      const { userId } = req;
      const where = {};
      const cvWhere = {
        userId: {
          [Op.ne]: userId,
        },
      };
      if (city) {
        where.city = city;
      }
      const userNotices = await Notification.findAll({
        where: {
          noticeFrom: userId,
        },
      });
      if (userNotices) {
        const noShowWorks = userNotices.map((e) => e.noticeTo);
        const uniqId = [...new Set(noShowWorks)];
        where.id = { $notIn: uniqId };
      }
      const users = await Users.findAll({
        where,
        include: [
          {
            as: 'createdCvs',
            model: Cvs,
            required: true,
            where: cvWhere,
          },
        ],
        raw: false,
      });
      console.log(users, 55555);
      res.json({
        users,
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };
}
export default CvsController;
