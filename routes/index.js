import express from 'express';
import users from './users';
import jobs from './jobs';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => { // eslint-disable-line no-unused-vars
  res.json({
    status: 'ok',
  });
});
router.use('/users', users);
router.use('/jobs', jobs);
export default router;
