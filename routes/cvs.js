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
    if (['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/x-icon'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(HttpError(422, 'Invalid file type'), false);
    }
  },
});
router.post('/create-cv', upload.single('avatar'), CvsController.createCv);
router.get('/singleCv/:id', CvsController.singleCv);
router.post('/usersData', CvsController.usersData);
router.get('/random-cvs', CvsController.getRandomCvs);
router.post('/usersDataForMap', CvsController.usersDataForMap);
router.put('/edit-cv-link', CvsController.addCvLink);

export default router;
