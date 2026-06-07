import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { adminAuth, requireSession } from '../middleware/authMiddleware';

const router = Router();

router.get('/', adminAuth, bookingController.list);
router.post('/', bookingController.create);
router.post('/draft', bookingController.createDraft);
router.post('/confirm-credit', requireSession, bookingController.confirmCredit);
router.get('/active-draft', requireSession, bookingController.getActiveDraft);
router.post('/check-email', bookingController.checkEmail);
router.get('/history', requireSession, bookingController.getHistory);
router.get('/profile', requireSession, bookingController.getProfile);
router.post('/rituals', adminAuth, bookingController.sendRitual);
router.patch('/:id', adminAuth, bookingController.update);
router.delete('/:id', adminAuth, bookingController.delete);
router.post('/:id/regenerate-zoom', adminAuth, bookingController.regenerateZoom);

export default router;

