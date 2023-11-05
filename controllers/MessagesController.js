import HttpError from 'http-errors';
import path from 'path';
import { v4 as uuidV4 } from 'uuid';
import fs from 'fs';
import Socket from '../services/Socket';
import { Messages, Files } from '../models/index';

class MessagesController {
  static send = async (req, res, next) => {
    try {
      const { userId, files } = req;
      const { type = 'text', text = '', friendId } = req.body;
      const message = await Messages.create({
        text,
        type,
        to: friendId,
        from: userId,
      });
      const uploadFiles = files.map((file) => {
        const fileName = path.join(`/images/uploads/${uuidV4()}_${file.originalname}`);
        const filePath = path.resolve(path.join('public', fileName));
        console.log(file);
        fs.writeFileSync(filePath, file.buffer);
        // fs.renameSync(file.path, path.resolve(path.join('public/images', filePath)));
        return {
          messageId: message.id,
          path: filePath,
          name: fileName,
          type: file.mimetype,
          size: file.size,
        };
      });
      message.files = await Files.bulkCreate(uploadFiles);
      message.setDataValue('files', message.files);
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

      if (!friendId) {
        throw HttpError(404, 'Dont found messages');
      }

      const messages = await Messages.findAll({
        where: {
          $or: [
            { to: userId, from: friendId },
            { to: friendId, from: userId },
          ],
        },
        include: [{
          model: Files,
          as: 'files',
          required: false,
        }],
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
        include: [{
          model: Files,
          as: 'files',
        }],
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
