import { Router } from 'express';
import { availabilityController } from '../controllers/availabilityController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', availabilityController.get);
router.get('/blocked', adminAuth, availabilityController.listBlocked);
router.post('/block', adminAuth, availabilityController.block);
router.delete('/block/:id', adminAuth, availabilityController.unblock);

export default router;
