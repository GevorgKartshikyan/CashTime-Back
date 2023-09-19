import HttpError from 'http-errors';
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

  static getSkillsForAdmin = async (req, res, next) => {
    try {
      const { page = 1, limit = 40, q } = req.query;
      let offset;
      if (page && limit) {
        offset = (page - 1) * limit;
      }
      const where = {};
      if (q) {
        where.skill = { $like: `%${q}%` };
      }
      const { count, rows: skills } = await SkillsBase.findAndCountAll({
        where,
        offset,
        limit: +limit,
      });
      let totalPages;
      if (count && limit) {
        totalPages = Math.ceil(count / limit);
      }
      res.json({
        skillsForAdmin: skills,
        currentPage: +page,
        totalPages,
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };

  static addSkillForAdmin = async (req, res, next) => {
    try {
      const { skill } = req.body;
      console.log(skill);
      const existingSkill = await SkillsBase.findOne({
        where: {
          skill,
        },
      });
      if (existingSkill) {
        throw HttpError(403, 'Skill Existing');
      }
      const addedSkill = await SkillsBase.create({
        skill,
      });
      res.json({
        status: 'ok',
        addedSkill,
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteSkillForAdmin = async (req, res, next) => {
    try {
      const { id } = req.body;
      const skill = await SkillsBase.findByPk(id);
      if (!skill) {
        throw HttpError(404, 'Skill not found');
      }
      const deletedSkill = await skill.destroy();
      res.json({
        status: 'ok',
        deletedSkill,
      });
    } catch (e) {
      next(e);
    }
  };
}
export default AppController;
