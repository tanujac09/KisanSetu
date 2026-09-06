import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';

const router = Router();
router.post('/farmer/register', auth.farmerRegister);
router.post('/farmer/login', auth.farmerLogin);
router.post('/buyer/register', auth.buyerRegister);
router.post('/buyer/login', auth.buyerLogin);
router.post('/buyer/otp/request', auth.buyerOtpRequest);
router.post('/buyer/otp/verify', auth.buyerOtpVerify);
router.get('/me', requireAuth, auth.me);
export default router;
