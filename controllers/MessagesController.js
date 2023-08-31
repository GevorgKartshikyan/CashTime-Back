import { Socket } from 'socket.io';
import { Messages } from '../models/index';

class MessagesController {
  static send = async (req, res, next) => {
    try {
      const { text = '', friendId } = req.body;
      const { userId } = req;
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
      const { friendId, limit = 20, page } = req.query;
      // console.log(req.query);

      const messages = await Messages.findAll({
        where: {
          $or: [
            { to: userId, from: friendId },
            { to: friendId, from: userId },
          ],
        },
        limit: +limit,
        offset: (page - 1) * limit,
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
}
export default MessagesController;
