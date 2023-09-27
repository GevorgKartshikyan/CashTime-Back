import path from 'path';
import fs from 'fs';
import { v4 as uuidV4 } from 'uuid';
import HttpError from 'http-errors';
import { Users, Jobs, Notification } from '../models/index';

class JobsController {
  static jobsListFromUsersBox = async (req, res, next) => {
    try {
      const {
        page = 1, limit = 5, city = '', order,
      } = req.query;
      const offset = (page - 1) * limit;
      const { userId } = req;
      const {
        title, experience_level: experienceLevel = {}, job_type: jobType, date,
      } = req.body;
      const jobNotices = await Notification.findAll({
        where: {
          noticeFrom: userId,
        },
      });
      const where = {
        status: 'active',
        alreadyDone: false,
        userId: {
          $ne: userId,
        },
      };
      if (jobNotices) {
        const noShowWorks = jobNotices.map((e) => e.noticeJobTo);
        const uniqId = [...new Set(noShowWorks)];
        where.id = { $notIn: uniqId };
      }
      if (title) {
        where.title = { $like: `%${title}%` };
      }
      // experienceLevel
      const experienceLevelArray = Object.values(experienceLevel).filter((value) => value !== '' && value !== null && value !== undefined);
      if (experienceLevelArray.length > 0) {
        where.experience = { $in: experienceLevelArray };
      }

      // price method && price
      const priceMethod = [jobType.hourly, jobType.fixed].filter((value) => value !== '');
      if (priceMethod.length > 0) {
        where.priceMethod = { $in: priceMethod };
      }
      const minPriceFixed = +jobType.salary_min;
      const maxPriceFixed = +jobType.salary_max;
      const maxPriceHourly = +jobType.hour_max;
      const minPriceHourly = +jobType.hour_min;
      // eslint-disable-next-line max-len
      if (maxPriceFixed && minPriceFixed && !Number.isNaN(maxPriceFixed) && !Number.isNaN(minPriceFixed) && priceMethod.includes('Project Budget')) {
        where.priceFixed = {
          $between: [minPriceFixed, maxPriceFixed],
        };
      } else if (minPriceFixed && !Number.isNaN(minPriceFixed) && priceMethod.includes('Project Budget')) {
        where.priceFixed = {
          $gte: minPriceFixed,
        };
      } else if (maxPriceFixed && !Number.isNaN(maxPriceFixed) && priceMethod.includes('Project Budget')) {
        where.priceFixed = {
          $lte: maxPriceFixed,
        };
      }

      if (minPriceHourly && !Number.isNaN(minPriceHourly) && priceMethod.includes('Hourly Rate')) {
        where.priceMinHourly = {
          $gte: minPriceHourly,
        };
      }
      if (maxPriceHourly && !Number.isNaN(maxPriceHourly) && priceMethod.includes('Hourly Rate')) {
        where.priceMaxHourly = {
          $lte: maxPriceHourly,
        };
      }
      // location 'city'
      if (city) {
        where.city = city;
      }
      // date
      if (date.from && date.to) {
        where.createdAt = {
          $between: [date.from, date.to],
        };
      }
      // order
      let orderBy;
      if (order === 'Newest') {
        orderBy = [['createdAt', 'DESC']];
      } else if (order === 'Latest') {
        orderBy = [['createdAt', 'ASC']];
      } else {
        orderBy = [['createdAt', 'DESC']];
      }

      const { count, rows: jobs } = await Jobs.findAndCountAll({
        where,
        offset,
        limit: +limit,
        order: orderBy,
        include: [
          {
            model: Users,
            as: 'creator',
            attributes: ['firstName', 'lastName', 'avatar'],
            required: true,
          },
        ],
        raw: true,
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

  static createJob = async (req, res, next) => {
    try {
      const { file, userId } = req;
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
        userId,
        title,
        skills,
        experience,
        priceMethod: price.method,
        priceFixed: price.maxPrice,
        priceMinHourly: price.priceFrom,
        priceMaxHourly: price.priceTo,
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
      next(e);
    }
  };

  static editJob = async (req, res, next) => {
    try {
      const { jobId } = req.params; // change
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
      }

      const { city, country, fullAddress } = address;

      const updatedJob = {
        title,
        skills,
        experience,
        priceMethod: price.method,
        priceFixed: price.maxPrice,
        priceMinHourly: price.priceFrom,
        priceMaxHourly: price.priceTo,
        description,
        geometry: location,
        phoneNumber,
        city,
        country,
        fullAddress,
        jobPhoto,
        status: 'pending',
      };

      const [rowsAffected, [updatedJobData]] = await Jobs.update(updatedJob, {
        where: { id: jobId }, // change
        returning: true,
      });

      if (rowsAffected === 0) {
        throw HttpError(404, 'job not found');
      }

      res.json({
        job: updatedJobData,
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };

  static activateJob = async (req, res, next) => {
    try {
      const { jobId } = req.body;
      console.log(jobId);
      const job = await Jobs.findOne({
        where: {
          id: jobId,
          status: 'pending',
        },
      });
      job.status = 'active';
      await job.save();
      res.json({
        status: 'ok',
        job,
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteJob = async (req, res, next) => {
    try {
      const { jobId } = req.body;
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
      const { page = 1, limit = 5 } = req.query;
      const offset = (page - 1) * limit;
      const { count, rows: jobs } = await Jobs.findAndCountAll({
        where: {
          status: 'pending',
        },
        offset,
        limit: +limit,
        include: [
          {
            model: Users,
            as: 'creator',
            attributes: ['firstName', 'lastName', 'avatar'],
            required: false,
          },
        ],
        raw: true,
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

  static jobsListFromUsersMap = async (req, res, next) => {
    try {
      const { city } = req.query;
      const whereCondition = {
        alreadyDone: false,
        status: 'active',
        city,
      };
      const { rows: jobs } = await Jobs.findAndCountAll(
        {
          where: whereCondition,
          include: [
            {
              model: Users,
              as: 'creator',
              attributes: ['firstName', 'lastName', 'avatar'],
              required: false,
            },
          ],
          raw: true,
        },
      );
      res.json({
        jobs,
      });
    } catch (e) {
      next(e);
    }
  };

  static jobDone = async (req, res, next) => {
    try {
      const { jobId } = req.body;
      const job = await Jobs.findOne({
        where: {
          id: jobId,
          status: 'active',
          alreadyDone: false,
        },
      });
      job.alreadyDone = true;
      await job.save();
    } catch (e) {
      next(e);
    }
  };

  static singleJobInfo = async (req, res, next) => {
    try {
      const { id } = req.query;
      const singleJob = await Jobs.findOne({
        where: {
          id,
          status: 'active',
          alreadyDone: false,
        },
      });
      if (!singleJob) {
        throw HttpError(404, 'JOB NOT FOUND');
      }
      res.json({
        singleJob,
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };

  static jobsTitles = async (req, res, next) => {
    try {
      const { userId } = req;
      const jobsTitles = await Jobs.findAll({
        where: {
          userId,
        },
        attributes: ['id', 'title'],
      });
      res.json({
        status: 'ok',
        jobsTitlesArray: jobsTitles,
      });
    } catch (e) {
      next(e);
    }
  };
}
export default JobsController;
