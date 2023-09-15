import express from 'express';
import UtilsController from '../controllers/UtilsController';

const router = express.Router();

router.post('/create-countries', UtilsController.createCountriesInDataBase);
router.get('/get-countries', UtilsController.getCountries);
export default router;
