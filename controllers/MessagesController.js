import HttpError from 'http-errors';
import Socket from '../services/Socket';
import { Messages } from '../models/index';

class MessagesController {
  static send = async (req, res, next) => {
    try {
      const { userId } = req;
      const { text = '', friendId } = req.body;
      const message = await Messages.create({
        text,
        to: friendId,
        from: userId,
      });
      Socket.emitUser(friendId, 'new_message', message);
      res.json({
        status: 'ok',
        message,
      });
    } catch (e) {
      next(e);
    }
  };

  static list = async (req, res, next) => {
    try {
      const { userId } = req;
      const { friendId } = req.query;

      const messages = await Messages.findAll({
        where: {
          $or: [
            { to: userId, from: friendId },
            { to: friendId, from: userId },
          ],
        },
        order: [['createdAt', 'desc']],
      });

      res.json({
        status: 'ok',
        messages,
      });
    } catch (e) {
      next(e);
    }
  };

  static open = async (req, res, next) => {
    try {
      const { userId } = req;
      const { id } = req.body;
      const message = await Messages.findOne({
        where: {
          id,
          to: userId,
        },
      });
      if (!message) {
        throw HttpError(404);
      }
      message.seen = new Date();
      await message.save();

      Socket.emitUser(message.from, 'open_message', message);

      res.json({
        status: 'ok',
        message,
      });
    } catch (e) {
      next(e);
    }
  };

  static newMessages = async (req, res, next) => {
    try {
      const { userId } = req;
      const newMessages = await Messages.count({
        where: {
          to: userId,
          seen: null,
        },
      });
      res.json({
        status: 'ok',
        newMessages,
      });
    } catch (e) {
      next(e);
    }
  };

  static friendTyping = async (req, res, next) => {
    try {
      const { isTyping, friendId } = req.body;
      Socket.emitUser(friendId, 'typing', isTyping);
      res.json({
        status: 'ok',
        isTyping,
      });
    } catch (e) {
      next(e);
    }
  };
}
export default MessagesController;
