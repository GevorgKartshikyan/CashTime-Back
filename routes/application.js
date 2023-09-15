import express from 'express';
import AppController from '../controllers/AppController';

const router = express.Router();

router.get('/get-countries', AppController.getCountries);
router.get('/get-skills', AppController.getSkills);

export default router;
