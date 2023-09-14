import express from 'express';
import multer from 'multer';
import HttpError from 'http-errors';
import CvsController from '../controllers/CvsController';

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
router.post('/create-cv', upload.single('avatar'), CvsController.createCv);
router.get('/singleCv/:id', CvsController.singleCv);
export default router;
