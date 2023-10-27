import express from 'express';
import multer from 'multer';
import HttpError from 'http-errors';
import ReviewsController from '../controllers/ReviewsController';

const router = express.Router();

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

router.post('/send', upload.array('files[]', 4), ReviewsController.sendReview);
router.get('/list-in-progress', ReviewsController.reviewsInProgress);
router.put('/confirm', ReviewsController.confirmReview);
router.delete('/delete/:id', ReviewsController.cancelReview);
router.get('/list', ReviewsController.list);
export default router;
