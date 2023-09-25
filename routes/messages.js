import express from 'express';
import MessagesController from '../controllers/MessagesController';

const router = express.Router();

router.post('/send', MessagesController.send);
router.get('/list', MessagesController.list);
router.put('/open', MessagesController.open);
router.get('/newMessages', MessagesController.newMessages);

export default router;
