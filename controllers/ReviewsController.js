import path from 'path';
import fs from 'fs';
import { v4 as uuidV4 } from 'uuid';
import HttpError from 'http-errors';
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
      await notice.destroy();
      const uploadFiles = files.map((file) => {
        const fileName = path.join(`/images/uploads/${uuidV4()}_${file.originalname}`);
        const filePath = path.resolve(path.join('public', fileName));
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
      const { userId = 6 } = req;
      const { id } = req.body;
      const review = await Reviews.findByPk(id);
      review.status = 'active';
      await review.save();
      const user = await Users.findByPk(userId);
      const reviewCount = await Reviews.count({
        where: {
          status: 'active',
          userTo: userId,
        },
      });
      user.allStars = +user.allStars + review.rate;
      user.stars = +user.allStars / reviewCount;
      user.totalJobs += 1;
      await user.save();
      res.json({
        review,
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };
}
export default ReviewsController;
