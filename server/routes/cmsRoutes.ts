import { Router } from 'express';
import { cmsController } from '../controllers/cmsController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

// Public batch endpoint for client-side loading
router.get('/', cmsController.getBatch);

// Hero Content routes
router.get('/hero', cmsController.getHero);
router.put('/hero', adminAuth, cmsController.updateHero);

// Transformation Steps routes
router.get('/steps', cmsController.getSteps);
router.put('/steps/:id', adminAuth, cmsController.updateStep);

// Founder Bio routes
router.get('/founder', cmsController.getFounder);
router.put('/founder', adminAuth, cmsController.updateFounder);
router.post('/upload', adminAuth, cmsController.uploadImage);

// Quotes routes
router.get('/quotes', cmsController.getQuotes);
router.post('/quotes', adminAuth, cmsController.createQuote);
router.put('/quotes/:id', adminAuth, cmsController.updateQuote);
router.delete('/quotes/:id', adminAuth, cmsController.deleteQuote);

// Reviews routes
router.get('/reviews', cmsController.getReviews);
router.post('/reviews', adminAuth, cmsController.createReview);
router.put('/reviews', adminAuth, cmsController.updateReview);
router.put('/reviews/:id', adminAuth, cmsController.updateReview);
router.delete('/reviews/:id', adminAuth, cmsController.deleteReview);

// Testimonials alias routes
router.get('/testimonials', cmsController.getReviews);
router.post('/testimonials', adminAuth, cmsController.createReview);
router.put('/testimonials', adminAuth, cmsController.updateReview);
router.put('/testimonials/:id', adminAuth, cmsController.updateReview);
router.delete('/testimonials/:id', adminAuth, cmsController.deleteReview);

// Offerings routes
router.get('/offerings', cmsController.getOfferings);
router.post('/offerings', adminAuth, cmsController.createOffering);
router.put('/offerings/:id', adminAuth, cmsController.updateOffering);
router.delete('/offerings/:id', adminAuth, cmsController.deleteOffering);

// Intelligence Matrix routes
router.get('/intelligence', cmsController.getIntelligence);
router.put('/intelligence/:id', adminAuth, cmsController.updateIntelligence);

export default router;
