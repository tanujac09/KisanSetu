import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as market from '../controllers/marketController.js';

const router = Router();
router.get('/auctions', requireAuth, market.listAuctions);
router.post('/auctions', requireAuth, requireRole('farmer'), market.createAuction);
router.post('/auctions/:id/bid', requireAuth, requireRole('buyer'), market.placeBid);
router.post('/auctions/:id/finalize', requireAuth, requireRole('farmer'), market.finalizeAuction);
export default router;
