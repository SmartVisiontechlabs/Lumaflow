import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.post('/magic-link', authController.sendMagicLink);

export default router;
