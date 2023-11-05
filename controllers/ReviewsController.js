import path from 'path';
import fs from 'fs';
import { v4 as uuidV4 } from 'uuid';
import HttpError from 'http-errors';
import { literal } from 'sequelize';
import Reviews from '../models/Reviews';
import Files from '../models/Files';
import Jobs from '../models/Jobs';
import Users from '../models/Users';
import Notification from '../models/Notification';

class ReviewsController {
  static sendReview = async (req, res, next) => {
    try {
      const { files, userId } = req;
      const {
        text, rate, friendId, jobId,
      } = req.body;
      const review = await Reviews.create({
        text,
        rate,
        userFrom: userId,
        userTo: +friendId,
        status: 'pending',
        jobId,
      });
      if (!review) {
        throw HttpError(403, 'Review dont send');
      }
      const notice = await Notification.findOne({
        where: {
          noticeJobTo: jobId,
        },
      });
      if (notice) {
        await notice.destroy();
      }
      const uploadFiles = files.map((file) => {
        const fileName = path.join(`/images/reviews/${uuidV4()}_${file.originalname}`);
        const filePath = path.resolve(path.join('public', fileName));
        console.log(filePath, 90909);
        fs.writeFileSync(filePath, file.buffer);
        return {
          reviewId: review.id,
          path: filePath,
          name: fileName,
          type: file.mimetype,
          size: file.size,
        };
      });
      review.files = await Files.bulkCreate(uploadFiles);
      review.setDataValue('files', review.files);
      res.json({
        status: 'ok',
        review,
      });
    } catch (e) {
      next(e);
    }
  };

  static reviewsInProgress = async (req, res, next) => {
    try {
      const { userId } = req;
      const reviews = await Reviews.findAll({
        attributes: ['id'],
        where: {
          status: 'pending',
          userTo: userId,
        },
        include: [
          {
            model: Jobs,
            as: 'jobReviews',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'reviewFrom',
            attributes: ['firstName', 'lastName', 'avatar'],
          },
        ],
      });
      res.json({
        status: 'ok',
        reviews,
      });
    } catch (e) {
      next(e);
    }
  };

  static confirmReview = async (req, res, next) => {
    try {
      const { userId } = req;
      const { id } = req.body;
      const review = await Reviews.findByPk(id, {
        attributes: ['id', 'rate'],
      });
      review.status = 'active';
      await review.save();
      console.log(review);
      // console.log(review.rate, 9999999999);
      const user = await Users.findByPk(userId);
      const reviewCount = await Reviews.count({
        where: {
          status: 'active',
          userTo: userId,
        },
      });
      user.allStars += +review.rate;
      user.stars = +user.allStars / reviewCount;
      user.totalJobs += 1;
      await user.save();
      res.json({
        review,
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };

  static cancelReview = async (req, res, next) => {
    try {
      const { id } = req.params;
      const review = await Reviews.findOne({
        where: {
          id,
          status: 'pending',
        },
      });
      const deletedReview = await review.destroy();
      res.json({
        status: 'ok',
        deletedReview,
      });
    } catch (e) {
      next(e);
    }
  };

  static list = async (req, res, next) => {
    try {
      const { userId } = req;
      const { userTo, limit, page } = req.query;
      const offset = (page - 1) * limit;
      const reviews = await Reviews.findAll({
        attributes: [
          'rate',
          'text',
          'id',
          [literal("DATE_FORMAT(reviews.createdAt, '%d.%m.%Y')"), 'formattedCreatedAt'],
        ],
        where: {
          status: 'active',
          userTo: userTo || userId,
        },
        offset,
        limit: +limit,
        include: [
          {
            model: Users,
            as: 'reviewFrom',
            attributes: ['firstName', 'lastName', 'avatar'],
          },
          {
            model: Files,
            as: 'files',
            attributes: ['name', 'id'],
          },
        ],
      });
      const count = await Reviews.count({
        where: {
          status: 'active',
          userTo: userTo || userId,
        },
      });
      const totalPages = Math.ceil(count / limit);
      res.json({
        reviews,
        currentPage: +page,
        totalPages,
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };
}
export default ReviewsController;
