import express from 'express';
import MessagesController from '../controllers/MessagesController';

const router = express.Router();

router.post('/send', MessagesController.send);
router.get('/list', MessagesController.list);
router.put('/open', MessagesController.open);
router.put('/typing', MessagesController.friendTyping);
router.get('/newMessages', MessagesController.newMessages);

export default router;
