import express from 'express';
import multer from 'multer';
import HttpError from 'http-errors';
import UsersController from '../controllers/UsersController';

const router = express.Router();

/* GET users listing. */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (req, file, cb) => {
    if (['image/png', 'image/jpeg', 'image/webp , image/svg+xml'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(HttpError(422, 'Invalid file type'), false);
    }
  },
});

router.post('/register', upload.single('avatar'), UsersController.register);
router.post('/login', UsersController.login);
router.post('/activate', UsersController.activate);
router.get('/list', UsersController.list);
router.get('/single/:userId', UsersController.singleUser);
router.get('/singleUserFromAdmin', UsersController.singleUserFromAdmin);
router.get('/profile', UsersController.profile);
<<<<<<< HEAD
=======
router.put('/status', UsersController.status);

>>>>>>> b58939c2bf127d1f60abe24be6a6de7fd1750d03
export default router;
