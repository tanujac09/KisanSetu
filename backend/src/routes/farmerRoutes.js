import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as farmer from '../controllers/farmerController.js';

const router = Router();
router.use(requireAuth, requireRole('farmer'));
router.get('/products', farmer.listProducts);
router.post('/products', farmer.createProduct);
router.delete('/products/:id', farmer.deleteProduct);
router.get('/products/:id/matches', farmer.getProductMatches);
router.get('/transactions', farmer.listTransactions);
router.get('/dashboard-summary', farmer.dashboardSummary);
router.get('/match-feed', farmer.matchFeed);
export default router;
