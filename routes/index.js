import express from 'express';
import users from './users';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => { // eslint-disable-line no-unused-vars
  res.json({
    status: 'okay',
  });
});
router.use('/users', users);
export default router;
