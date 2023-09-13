import express from 'express';
import ReportsController from '../controllers/ReportsController';

const router = express.Router();

router.post('/report-message', ReportsController.reportText);
export default router;
