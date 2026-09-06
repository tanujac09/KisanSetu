import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as buyer from '../controllers/buyerController.js';

const router = Router();
router.use(requireAuth, requireRole('buyer'));
router.get('/requirements', buyer.listRequirements);
router.post('/requirements', buyer.createRequirement);
router.delete('/requirements/:id', buyer.deleteRequirement);
router.get('/requirements/:id/matches', buyer.getRequirementMatches);
router.get('/transactions', buyer.listTransactions);
router.get('/dashboard-summary', buyer.dashboardSummary);
router.get('/match-feed', buyer.matchFeed);
export default router;
