import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', adminAuth, bookingController.list);
router.post('/', bookingController.create);
router.post('/rituals', adminAuth, bookingController.sendRitual);
router.patch('/:id', adminAuth, bookingController.update);
router.delete('/:id', adminAuth, bookingController.delete);

export default router;
