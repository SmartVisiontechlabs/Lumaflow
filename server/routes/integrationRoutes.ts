import { Router } from 'express';
import { requireSession, adminAuth } from '../middleware/authMiddleware';
import { googleCalendarService } from '../services/googleCalendarService';

const router = Router();

/**
 * GET /api/integrations/google
 * Fetch current status of Google integration for the authenticated admin.
 */
router.get('/google', requireSession, adminAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const integration = await googleCalendarService.getIntegration(userId);

    if (!integration) {
      return res.status(200).json({ connected: false });
    }

    return res.status(200).json({
      connected: true,
      email: integration.google_email,
      connectedAt: integration.connected_at,
      updatedAt: integration.updated_at
    });
  } catch (error: any) {
    console.error('❌ [Integration Routes] Status fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve connection status' });
  }
});

/**
 * DELETE /api/integrations/google
 * Remove Google Calendar integration.
 */
router.delete('/google', requireSession, adminAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    await googleCalendarService.disconnect(userId);
    return res.status(200).json({ success: true, message: 'Google Calendar disconnected successfully' });
  } catch (error: any) {
    console.error('❌ [Integration Routes] Disconnect error:', error);
    return res.status(500).json({ error: error.message || 'Failed to disconnect Google Calendar' });
  }
});

export default router;
