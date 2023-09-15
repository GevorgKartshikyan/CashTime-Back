import axios from 'axios';
import { Countries, SkillsBase } from '../models/index';
import { dataSkills } from '../dataRemove/dataSkills';

class UtilsController {
  static createCountriesInDataBase = async (req, res, next) => {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all');
      const { data } = response;
      const createdCountries = [];
      const createPromises = data.map(async (countryData) => {
        const country = await Countries.create({
          value: countryData.cca2.toLowerCase(),
          label: countryData.name.common,
        });
        createdCountries.push(country);
      });
      await Promise.all(createPromises);
      res.json({
        countries: createdCountries,
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };

  static getCountries = async (req, res, next) => {
    try {
      const countries = await Countries.findAll();
      res.json(countries);
    } catch (e) {
      next(e);
    }
  };

  static createBaseSkills = async (req, res, next) => {
    try {
      const baseSkills = [];
      const createdPromise = dataSkills.map(async (skill) => {
        const skills = await SkillsBase.create({
          skill,
        });
        baseSkills.push(skills);
      });
      await Promise.all(createdPromise);
      res.json({
        status: 'ok',
        skills: baseSkills,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default UtilsController;
