import HttpError from 'http-errors';
import { Jobs, Notification, Users } from '../models/index';
import socket from '../services/Socket';

class NotificationController {
  static sendNotice = async (req, res, next) => {
    try {
      const { noticeTo, noticeJobTo } = req.body;
      const { userId } = req;
      const notice = await Notification.create({
        noticeTo,
        noticeFrom: userId,
        noticeJobTo,
      });
      socket.emitUser(noticeTo.to, 'send_notice', notice);
      res.json({
        notice,
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteNotice = async (req, res, next) => {
    try {
      const { id, noticeJobTo } = req.body;
      const { userId } = req;
      const where = {
        id,
        noticeTo: userId,
      };
      if (noticeJobTo) {
        where.noticeTo = noticeJobTo;
      }
      const notice = await Notification.findOne({
        where,
      });
      if (!notice) {
        throw HttpError(404, 'notification not found');
      }
      await notice.destroy();
      res.json({
        status: 'ok',
        notice,
      });
    } catch (e) {
      next(e);
    }
  };

  static confirmNotice = async (req, res, next) => {
    try {
      const { id, noticeJobTo } = req.body;
      const { userId } = req;
      const where = {
        id,
        noticeTo: userId,
        done: false,
      };
      if (noticeJobTo) {
        where.noticeTo = noticeJobTo;
      }
      const notice = await Notification.findOne({
        where,
      });
      if (!notice) {
        throw HttpError(404, 'notification not found');
      }
      notice.done = true;
      await notice.save();
      res.json({
        status: 'ok',
        notice,
      });
    } catch (e) {
      next(e);
    }
  };

  static noticeList = async (req, res, next) => {
    try {
      const { userId } = req;
      const { page = 1, limit = 5 } = req.query;
      const offset = (page - 1) * limit;
      const { count, rows: notices } = await Notification.findAndCountAll({
        where: {
          noticeTo: userId,
          done: false,
        },
        offset,
        limit: +limit,
        include: [
          {
            model: Users,
            as: 'userFrom',
            attributes: ['firstName', 'lastName', 'avatar', 'id'],
            required: true,
          },
          {
            model: Jobs,
            as: 'fromJob',
            attributes: ['id'],
            required: false,
          },
        ],
      });
      const totalPages = Math.ceil(count / limit);
      res.json({
        status: 'ok',
        notices,
        currentPage: +page,
        totalPages,
      });
    } catch (e) {
      next(e);
    }
  };
}
export default NotificationController;
