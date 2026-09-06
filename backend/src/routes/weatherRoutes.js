import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as weather from '../controllers/weatherController.js';

const router = Router();
router.get('/', requireAuth, weather.fetchWeather);
export default router;
