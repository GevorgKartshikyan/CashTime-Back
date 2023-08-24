import express from 'express';
import multer from 'multer';
import HttpError from 'http-errors';
import UsersController from '../controllers/UsersController';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (req, file, cb) => {
    if (['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(HttpError(422, 'Invalid file type'), false);
    }
  },
});

router.post('/register', upload.single('avatar'), UsersController.register);
router.get('/list', UsersController.list);
router.post('/activate', UsersController.activate);
router.get('/list', UsersController.list);
router.post('/login', UsersController.login);
export default router;
