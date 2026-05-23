import { Router, Request, Response } from 'express';
import { zoomService } from '../services/zoomService';

const router = Router();

/**
 * GET /api/zoom/test
 * Verifies connectivity to the Zoom API by generating an OAuth token.
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    console.log('📬 [Zoom Routes] GET /api/zoom/test - Connectivity test initiated');
    
    // Attempt token generation to verify environment credentials
    await zoomService.getZoomAccessToken();
    
    const userEmail = process.env.ZOOM_USER_EMAIL || 'unknown';
    console.log('✅ [Zoom Routes] GET /api/zoom/test - Credentials verified successfully');
    
    res.status(200).json({
      success: true,
      connected: true,
      account_email: userEmail,
      message: 'Zoom connected successfully'
    });
  } catch (error: any) {
    const errorMsg = error.message || error;
    console.error(`❌ [Zoom Routes] GET /api/zoom/test - Connection test failed: ${errorMsg}`);
    
    res.status(500).json({
      success: false,
      error: `Zoom connection failed: ${errorMsg}`
    });
  }
});

/**
 * POST /api/zoom/create-test-meeting
 * Automatically schedules a test meeting in Zoom for verification.
 */
router.post('/create-test-meeting', async (req: Request, res: Response) => {
  try {
    console.log('📬 [Zoom Routes] POST /api/zoom/create-test-meeting - Creating test meeting');
    
    // Set start time to 10 minutes in the future in ISO UTC format
    const defaultStartTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    const result = await zoomService.createZoomMeeting({
      topic: 'Lumaflow Test Healing Session',
      startTime: defaultStartTime,
      duration: 60,
    });
    
    console.log('✅ [Zoom Routes] POST /api/zoom/create-test-meeting - Test meeting created');
    
    res.status(200).json({
      success: true,
      meeting: {
        join_url: result.joinUrl,
        start_url: result.hostUrl,
        meeting_id: result.meetingId,
        password: result.password,
        start_time: result.startTime
      }
    });
  } catch (error: any) {
    const errorMsg = error.message || error;
    console.error(`❌ [Zoom Routes] POST /api/zoom/create-test-meeting - Failed to create test meeting: ${errorMsg}`);
    
    res.status(500).json({
      success: false,
      error: `Zoom meeting creation failed: ${errorMsg}`
    });
  }
});

export default router;
