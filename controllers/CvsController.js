import path from 'path';
import fs from 'fs';
import { v4 as uuidV4 } from 'uuid';
import HttpError from 'http-errors';
import Cvs from '../models/Cvs';

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
  // static activateJob = async (req, res, next) => {
  //   try {
  //     const jobId = 1;
  //     const job = await Jobs.findOne({
  //       where: {
  //         id: jobId,
  //         status: 'pending',
  //       },
  //     });
  //     job.status = 'active';
  //     await job.save();
  //     res.send({
  //       status: 'ok',
  //       job,
  //     });
  //   } catch (e) {
  //     next(e);
  //   }
  // };
  //
  // static deleteJob = async (req, res, next) => {
  //   try {
  //     const jobId = 1;
  //     const job = await Jobs.findOne({
  //       where: {
  //         id: jobId,
  //       },
  //     });
  //     await job.destroy();
  //     res.send({
  //       status: 'ok',
  //       job,
  //     });
  //   } catch (e) {
  //     next(e);
  //   }
  // };
  //
  // static allJobListFromAdmin = async (req, res, next) => {
  //   try {
  //     const { page = 1, limit = 20 } = req.query;
  //     const offset = (page - 1) * limit;
  //     const jobs = await Jobs.findAll({
  //       offset,
  //       limit: +limit,
  //     });
  //     const count = await Jobs.count();
  //     const totalPages = Math.ceil(count / limit);
  //     res.json({
  //       jobs,
  //       currentPage: +page,
  //       totalPages,
  //     });
  //   } catch (e) {
  //     next(e);
  //   }
  // };
  //
  // static jobsListFromUsers = async (req, res, next) => {
  //   try {
  //     const { page = 1, limit = 20 } = req.query;
  //     const offset = (page - 1) * limit;
  //     const whereCondition = {
  //       alreadyDone: false,
  //       status: 'active',
  //     };
  //
  //     const jobs = await Jobs.findAll({
  //       where: whereCondition,
  //       offset,
  //       limit: +limit,
  //     });
  //
  //     const count = await Jobs.count({
  //       where: whereCondition,
  //     });
  //
  //     const totalPages = Math.ceil(count / limit);
  //
  //     res.json({
  //       jobs,
  //       currentPage: +page,
  //       totalPages,
  //     });
  //   } catch (e) {
  //     next(e);
  //   }
  // };
}
export default CvsController;
