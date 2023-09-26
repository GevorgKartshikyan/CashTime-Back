import path from 'path';
import fs from 'fs';
import { v4 as uuidV4 } from 'uuid';
import Cvs from '../models/Cvs';
import Users from '../models/Users';

class CvsController {
  static createCv = async (req, res, next) => {
    try {
      const { file, userId } = req;
      const data = req.body;
      const {
        experience,
        goal,
        profRole,
        language,
        school,
        degree,
        datesAttended,
        services,
        hourlyRate,
        skills,
        bio,
        country,
        fullAddress,
        city,
        geometry,
        phoneNumber,
      } = data;
      let cvPhoto;
      if (file) {
        cvPhoto = path.join(`/images/cvs/${uuidV4()}_${file.originalname}`);
        const filePath = path.resolve(path.join('public', cvPhoto));
        fs.writeFileSync(filePath, file.buffer);
      }
      let location = null;
      if (geometry && geometry.longitude && geometry.latitude) {
        location = {
          type: 'Point',
          coordinates: [geometry.longitude, geometry.latitude],
        };
      }
      const cv = await Cvs.create({
        userId,
        experience,
        goal,
        profRole,
        language,
        school,
        degree,
        datesAttended,
        category: services,
        hourlyRate,
        skills,
        bio,
        country,
        fullAddress,
        city,
        phoneNumber,
        cvPhoto,
        geometry: location,
      });
      res.json({
        cv,
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };

  static singleCv = async (req, res, next) => {
    try {
      const cvId = req.params.id;
      const cv = await Cvs.findOne({
        where: {
          id: cvId,
        },
      });
      res.json({
        cv,
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };

  static usersData = async (req, res, next) => {
    try {
      const data = req.body;
      console.log(data);
      const users = await Users.findAll({
        include: [
          {
            as: 'createdCvs',
            model: Cvs,
            required: true,
          },
        ],
        raw: false,
      });
      // console.log(users, 77777);
      res.json({
        users,
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };
}
export default CvsController;
