import HttpError from 'http-errors';
import Admin from '../models/Admin';

class AdminController {
  static async create(req, res, next) {
    try {
      const {
        firstName, lastName, login, password,
      } = req.body;
      const admin = await Admin.create({
        firstName,
        lastName,
        login,
        password,
      });
      res.json({
        admin,
      });
    } catch (e) {
      next(e);
    }
  }

  static async adminLogin(req, res, next) {
    try {
      const {
        login,
        password,
      } = req.body;
      console.log(login, password);
      const admin = await Admin.findOne({
        where: {
          login,
          password: Admin.passwordHash(password),
        },
      });
      if (!admin) {
        throw HttpError(403, 'Invalid login or password');
      }

      res.json({
        status: 'ok',
        admin,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default AdminController;
