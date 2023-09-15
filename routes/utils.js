import express from 'express';
import UtilsController from '../controllers/UtilsController';

const router = express.Router();

router.post('/create-countries', UtilsController.createCountriesInDataBase);
router.post('/create-base-skills', UtilsController.createBaseSkills);
export default router;
