import { Router } from 'express';
import { availabilityController } from '../controllers/availabilityController';

const router = Router();

router.get('/', availabilityController.get);

export default router;
