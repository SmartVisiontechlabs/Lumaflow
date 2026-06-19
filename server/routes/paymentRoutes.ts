import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

const router = Router();

router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/create-package-checkout', paymentController.createPackageCheckoutSession);
router.post('/confirm', paymentController.confirmPayment);
router.post('/webhook', paymentController.handleWebhook);

export default router;

