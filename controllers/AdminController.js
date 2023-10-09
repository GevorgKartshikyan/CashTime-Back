import HttpError from 'http-errors';
import sequelize from '../services/sequelize';
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

  static getChart = async (req, res, next) => {
    try {
      const result = await sequelize.query(`
  SELECT
    charDate,
    COUNT(DISTINCT user_id) AS usersCount,
    COUNT(DISTINCT job_id) AS jobsCount
  FROM (
    SELECT
      DATE_FORMAT(u.createdAt, '%Y-%m') AS charDate,
      u.id AS user_id,
      NULL AS job_id
    FROM users u
    UNION ALL
    SELECT
      DATE_FORMAT(j.createdAt, '%Y-%m') AS charDate,
      NULL AS user_id,
      j.id AS job_id
    FROM jobs j
  ) AS combined_data
  GROUP BY charDate
  ORDER BY charDate;
`);

      const charDateArray = result[0].map((row) => row.charDate);
      const usersCountArray = result[0].map((row) => row.usersCount);
      const jobsCountArray = result[0].map((row) => row.jobsCount);
      res.json({
        status: 'ok',
        charDateArray,
        usersCountArray,
        jobsCountArray,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default AdminController;
