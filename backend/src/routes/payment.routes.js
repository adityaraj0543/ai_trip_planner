import { Router } from 'express';
import { createOrder, getPublicConfig, verifyPayment } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/config', getPublicConfig);
router.use(authenticate);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

export default router;
