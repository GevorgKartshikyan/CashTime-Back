import express from 'express';
import NotificationController from '../controllers/NotificationController';

const router = express.Router();

router.post('/send', NotificationController.sendNotice);
router.post('/delete', NotificationController.deleteNotice);
router.post('/confirm', NotificationController.confirmNotice);
router.get('/list', NotificationController.noticeList);
router.get('/single-job-list', NotificationController.noticeListForSingleJobs);
export default router;
