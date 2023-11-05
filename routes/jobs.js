import express from 'express';
import multer from 'multer';
import HttpError from 'http-errors';
import JobsController from '../controllers/JobsController';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (req, file, cb) => {
    if (['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/x-icon']
      .includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(HttpError(422, 'Invalid file type'), false);
    }
  },
});
router.post('/job-create', upload.single('jobImage'), JobsController.createJob);
router.get('/list-admin', JobsController.allJobListFromAdmin);
router.get('/jobs-list-map', JobsController.jobsListFromUsersMap);
router.post('/jobs-list-filter', JobsController.jobsListFromUsersBox);
router.post('/job-done', JobsController.jobDone);
router.post('/job-activate', JobsController.activateJob);
router.post('/job-delete', JobsController.deleteJob);
router.get('/job-singe-info', JobsController.singleJobInfo);
router.get('/user-job-info', JobsController.userSingleJobInfo);
router.get('/jobs-title', JobsController.jobsTitles);
router.get('/random-jobs', JobsController.getRandomJobs);
router.post('/job-edit', upload.single('jobImage'), JobsController.editJob);
export default router;
