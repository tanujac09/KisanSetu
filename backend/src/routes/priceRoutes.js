import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as price from '../controllers/priceController.js';

const router = Router();
router.get('/crops', requireAuth, price.getSupportedCrops);
router.get('/:crop', requireAuth, price.getPrice);
export default router;
