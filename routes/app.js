import express from 'express';
import AppController from '../controllers/AppController';

const router = express.Router();

router.get('/get-countries', AppController.getCountries);
router.get('/get-skills', AppController.getSkills);
router.put('/get-skills-admin', AppController.getSkillsForAdmin);
router.post('/add-skill', AppController.addSkillForAdmin);
router.post('/delete-skill', AppController.deleteSkillForAdmin);
router.get('/all-counts', AppController.getAllCountsForAdmin);

export default router;
