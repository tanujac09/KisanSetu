import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as txn from '../controllers/transactionController.js';

const router = Router();
router.post('/propose', requireAuth, txn.proposeDeal);
router.post('/:id/verification', requireAuth, requireRole('buyer'), txn.requestVerification);
router.post('/:id/release-payout', requireAuth, requireRole('buyer'), txn.releasePayout);
export default router;
