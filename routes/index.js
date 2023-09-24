import express from 'express';
import users from './users';
import jobs from './jobs';
import messages from './messages';
import cvs from './cvs';
import reports from './reports';
import utils from './utils';
import application from './app';
import notice from './notice';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => { // eslint-disable-line no-unused-vars
  res.json({
    status: 'ok',
  });
});
router.use('/users', users);
router.use('/jobs', jobs);
router.use('/messages', messages);
router.use('/cvs', cvs);
router.use('/reports', reports);
router.use('/utils', utils);
router.use('/app', application);
router.use('/notice', notice);
export default router;
