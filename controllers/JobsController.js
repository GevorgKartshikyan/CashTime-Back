import path from 'path';
import fs from 'fs';
import { v4 as uuidV4 } from 'uuid';
import { Jobs } from '../models/index';

class JobsController {
  static createJob = async (req, res, next) => {
    try {
      console.log(req.file, 789);
      const { file } = req;
      const body = JSON.parse(req.body.data);
      const {
        dataFromChild1: title,
        dataFromChild2: skills,
        dataFromChild3: experience,
        dataFromChild4: price,
        dataFromChild5: description,
        dataFromChild6,
      } = body;
      const { address, phoneNumber } = dataFromChild6;
      let location = null;

      if (address && address.longitude && address.latitude) {
        location = {
          type: 'Point',
          coordinates: [address.longitude, address.latitude],
        };
      }
      let jobPhoto;
      if (file) {
        jobPhoto = path.join(`/images/jobs/${uuidV4()}_${file.originalname}`);
        const filePath = path.resolve(path.join('public', jobPhoto));
        fs.writeFileSync(filePath, file.buffer);
      } else {
        jobPhoto = path.join('/images/jobs/default-job-image.jpg');
      }
      const { city, country, fullAddress } = address;
      const job = await Jobs.create({
        userId: 1,
        title,
        skills,
        experience,
        price,
        description,
        geometry: location,
        phoneNumber,
        city,
        country,
        fullAddress,
        jobPhoto,
        status: 'pending',
      });
      res.json({
        job,
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };

  static activateJob = async (req, res, next) => {
    try {
      const jobId = 1;
      const job = await Jobs.findOne({
        where: {
          id: jobId,
          status: 'pending',
        },
      });
      job.status = 'active';
      await job.save();
      res.send({
        status: 'ok',
        job,
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteJob = async (req, res, next) => {
    try {
      const jobId = 1;
      const job = await Jobs.findOne({
        where: {
          id: jobId,
        },
      });
      await job.destroy();
      res.send({
        status: 'ok',
        job,
      });
    } catch (e) {
      next(e);
    }
  };

  static allJobListFromAdmin = async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      const jobs = await Jobs.findAll({
        offset,
        limit: +limit,
      });
      const count = await Jobs.count();
      const totalPages = Math.ceil(count / limit);
      res.json({
        jobs,
        currentPage: +page,
        totalPages,
      });
    } catch (e) {
      next(e);
    }
  };

  static jobsListFromUsers = async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      const whereCondition = {
        alreadyDone: false,
        status: 'active',
      };

      const jobs = await Jobs.findAll({
        where: whereCondition,
        offset,
        limit: +limit,
      });

      const count = await Jobs.count({
        where: whereCondition,
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        jobs,
        currentPage: +page,
        totalPages,
      });
    } catch (e) {
      next(e);
    }
  };
}
export default JobsController;
