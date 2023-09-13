import express from 'express';
import users from './users';
import jobs from './jobs';
import messages from './messages';
import cvs from './cvs';
import reports from './reports';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => { // eslint-disable-line no-unused-vars
  res.json({
    status: 'okay',
  });
});
router.use('/users', users);
router.use('/jobs', jobs);
router.use('/messages', messages);
router.use('/cvs', cvs);
router.use('/reports', reports);
export default router;
