import HttpError from 'http-errors';
import {
  Jobs, Messages, Notification, Users,
} from '../models/index';
import Socket from '../services/Socket';

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
      if (!notice) {
        throw HttpError(403, 'aaa');
      }
      const singleNotices = await Notification.findOne({
        where: {
          id: notice.id,
        },
        include: [
          {
            model: Users,
            as: 'userFrom',
            attributes: ['firstName', 'avatar', 'id'],
            required: true,
          },
          {
            model: Jobs,
            as: 'fromJob',
            attributes: ['id'],
            required: false,
          },
        ],
        raw: true,
      });
      Socket.emitUser(noticeTo, 'new_notice', singleNotices);
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
      const { id, noticeJobTo } = req.body.data;
      const { userId } = req;
      console.log(id, noticeJobTo);
      const where = {
        id,
        noticeTo: userId,
      };
      if (noticeJobTo) {
        where.noticeJobTo = noticeJobTo;
      }
      const notice = await Notification.findOne({
        where,
      });
      if (!notice) {
        throw HttpError(404, 'notification not found');
      }
      const result = await notice.destroy();
      res.json({
        status: 'ok',
        notice: result,
      });
    } catch (e) {
      next(e);
    }
  };

  static confirmNotice = async (req, res, next) => {
    try {
      const {
        id, noticeJobTo, friendId, messageText,
      } = req.body.data;
      const { userId } = req;
      console.log(id, noticeJobTo, userId, 9999999);
      const where = {
        id,
        noticeTo: userId,
        done: false,
      };
      if (noticeJobTo) {
        where.noticeJobTo = noticeJobTo;
      }
      const notice = await Notification.findOne({
        where,
      });
      if (!notice) {
        throw HttpError(404, 'notification not found');
      }
      notice.done = true;
      await Messages.create({
        text: messageText,
        to: friendId,
        from: userId,
      });
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
      const notices = await Notification.findAll({
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
            attributes: ['firstName', 'avatar', 'id', 'lastName', 'country', 'city'],
            required: true,
          },
          {
            model: Jobs,
            as: 'fromJob',
            attributes: ['id', 'title'],
            required: false,
          },
        ],
        raw: true,
      });
      const count = await Notification.count({
        where: {
          noticeTo: userId,
          done: false,
        },
      });
      const totalPages = Math.ceil(count / limit);
      res.json({
        status: 'ok',
        notices,
        currentPage: +page,
        totalPages,
        count,
      });
    } catch (e) {
      next(e);
    }
  };

  static noticeListForSingleJobs = async (req, res, next) => {
    try {
      const { userId } = req;
      const { page = 1, limit = 5, jobId } = req.query;
      const offset = (page - 1) * limit;
      console.log(jobId, 9999999999);
      const { count, rows: notices } = await Notification.findAndCountAll({
        where: {
          noticeTo: userId,
          done: false,
          noticeJobTo: jobId,
        },
        offset,
        limit: +limit,
        include: [
          {
            model: Users,
            as: 'userFrom',
            attributes: ['firstName', 'avatar', 'id', 'lastName', 'country', 'city'],
            required: true,
          },
          {
            model: Jobs,
            as: 'fromJob',
            attributes: ['id', 'title'],
            required: false,
          },
        ],
        raw: true,
      });
      const totalPages = Math.ceil(count / limit);
      res.json({
        status: 'ok',
        notices,
        currentPage: +page,
        totalPages,
        count,
      });
    } catch (e) {
      next(e);
    }
  };
}
export default NotificationController;
