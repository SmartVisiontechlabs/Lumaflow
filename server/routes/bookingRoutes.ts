import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';

const router = Router();

router.get('/', bookingController.list);
router.post('/', bookingController.create);

export default router;
