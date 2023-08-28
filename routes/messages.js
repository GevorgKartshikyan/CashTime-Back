import express from 'express';
import MessagesController from '../controllers/MessagesController';

const router = express.Router();

router.post('/send', MessagesController.send);
router.get('/list', MessagesController.list);

export default router;
