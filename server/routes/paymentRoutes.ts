import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

const router = Router();

router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/confirm', paymentController.confirmPayment);

export default router;
