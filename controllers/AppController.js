import { Countries, SkillsBase } from '../models/index';

class AppController {
  static getCountries = async (req, res, next) => {
    try {
      const countries = await Countries.findAll();
      res.json(countries);
    } catch (e) {
      next(e);
    }
  };

  static getSkills = async (req, res, next) => {
    try {
      const { q = '' } = req.query;
      const where = {};
      if (q) {
        where.skill = { $like: `%${q}%` };
      }
      const skills = await SkillsBase.findAll({
        where,
        limit: 7,
      });
      res.json({
        skills,
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };
}
export default AppController;
