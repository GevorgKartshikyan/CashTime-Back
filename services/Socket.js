import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import Users from '../models/Users';

const { JWT_SECRET } = process.env;

class Socket {
  static init = (server) => {
    this.socket = new SocketServer(server, {
      cors: [
        'http://localhost:3000',
      ],
    });
    this.socket.on('connect', this.#handleConnect);
  };

  static #handleConnect = async (client) => {
    try {
      const { authorization } = client.handshake.headers;
      const { userId } = jwt.verify(authorization, JWT_SECRET);

      client.userId = userId;
      client.join(`user_${userId}`);
      client.on('disconnect', this.#handleDisconnect(client));

      this.socket.emit('user_online', { userId });

      const users = await Users.findByPk(client.userId);
      users.isOnline = true;
      await users.save();
    } catch (e) {
      console.log(e);
      setTimeout(() => {
        client.emit('authorization_error', { error: e.message });
      }, 100);
    }
  };

  static #handleDisconnect = (client) => async () => {
    try {
      this.socket.emit('user_offline', { userId: client.userId });
      const users = await Users.findByPk(client.userId);
      users.lastVisit = new Date();
      users.isOnline = false;
      await users.save();
    } catch (e) {
      console.error(e);
    }
  };

  static emitUser = (userId, ev, data = {}) => {
    this.socket.to(`user_${userId}`).emit(ev, data);
  };
}

export default Socket;
