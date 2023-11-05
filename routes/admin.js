import express from 'express';
import AdminController from '../controllers/AdminController';

const router = express.Router();

router.post('/login', AdminController.adminLogin);
router.post('/create', AdminController.create);
router.get('/chart', AdminController.getChart);

export default router;
