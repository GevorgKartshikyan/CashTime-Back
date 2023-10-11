import express from 'express';
import multer from 'multer';
// import { v4 as uuidV4 } from 'uuid';
import HttpError from 'http-errors';
import MessagesController from '../controllers/MessagesController';

const router = express.Router();

// const upload = multer({
//   storage: multer.diskStorage({
//     filename(req, file, cb) {
//       cb(null, `${uuidV4()}__${file.originalname}`);
//     },
//   }),
// });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (req, file, cb) => {
    if (['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/x-icon'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(HttpError(422, 'Invalid file type'), false);
    }
  },
});

router.post('/send', upload.array('files[]', 12), MessagesController.send);
router.get('/list', MessagesController.list);
router.put('/open', MessagesController.open);
router.put('/typing', MessagesController.friendTyping);
router.get('/newMessages', MessagesController.newMessages);

export default router;
