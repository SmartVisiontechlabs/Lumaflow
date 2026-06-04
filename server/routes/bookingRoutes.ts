import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', adminAuth, bookingController.list);
router.post('/', bookingController.create);
router.post('/draft', bookingController.createDraft);
router.post('/confirm-credit', bookingController.confirmCredit);
router.get('/active-draft', bookingController.getActiveDraft);
router.post('/check-email', bookingController.checkEmail);
router.post('/restore-session', bookingController.restoreSession);
router.post('/rituals', adminAuth, bookingController.sendRitual);
router.patch('/:id', adminAuth, bookingController.update);
router.delete('/:id', adminAuth, bookingController.delete);

export default router;
