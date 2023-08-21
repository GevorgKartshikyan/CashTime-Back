import express from 'express';
import multer from 'multer';
import HttpError from 'http-errors';
import JobsController from '../JobsController';

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
router.post('/create-job', upload.single('jobImage'), JobsController.createJob);
export default router;
