import { Router } from 'express';
import { authController } from '../controllers/authController';
import { googleCalendarService } from '../services/googleCalendarService';
import { generateOAuthState, verifyOAuthState } from '../utils/crypto';
import { supabase, supabaseAdmin } from '../config/supabase';

const router = Router();

router.post('/magic-link', authController.sendMagicLink);

/**
 * GET /api/auth/google
 * Generates Google OAuth authorization URL and redirects.
 * Expects 'token' as query parameter for authentication.
 */
router.get('/google', async (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    console.warn('[Google OAuth] Attempt to connect without session token');
    return res.status(401).send('Unauthorized: Missing session token');
  }

  try {
    // Verify user using the session token
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return res.status(401).send('Unauthorized: Invalid session token');
    }

    // Verify user is an admin
    const client = supabaseAdmin || supabase;
    const { data: profile, error: profileErr } = await client
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr || !profile || profile.role !== 'admin') {
      return res.status(403).send('Forbidden: Admin access required');
    }

    // Generate OAuth URL with signed state parameter to prevent CSRF
    const state = generateOAuthState(user.id);
    const authUrl = googleCalendarService.getAuthUrl(state);
    
    console.log(`[Google OAuth] Redirecting user ${user.id} to Google: ${authUrl}`);
    res.redirect(authUrl);
  } catch (error: any) {
    console.error('[Google OAuth] Error generating URL:', error);
    res.status(500).send(`Authentication error: ${error.message}`);
  }
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth callback redirect.
 * Exchanges authorization code, saves tokens, and redirects back to settings dashboard.
 */
router.get('/google/callback', async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const error = req.query.error as string;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const successRedirect = `${frontendUrl}/admin/settings/integrations`;

  if (error) {
    console.warn(`[Google OAuth Callback] Consent denied or error returned by Google: ${error}`);
    return res.redirect(`${successRedirect}?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    console.error('[Google OAuth Callback] Missing authorization code or state');
    return res.redirect(`${successRedirect}?error=missing_parameters`);
  }

  try {
    // 1. Verify CSRF state parameter and extract admin userId
    const userId = verifyOAuthState(state);
    console.log(`[Google OAuth Callback] State verified. User ID: ${userId}`);

    // 2. Exchange authorization code for tokens and save integration record
    const googleEmail = await googleCalendarService.handleCallback(code, userId);

    // 3. Redirect back to settings integrations page with success query
    res.redirect(`${successRedirect}?status=success&email=${encodeURIComponent(googleEmail)}`);
  } catch (err: any) {
    console.error('[Google OAuth Callback] Callback processing failed:', err.message || err);
    res.redirect(`${successRedirect}?error=${encodeURIComponent(err.message || 'unknown_error')}`);
  }
});

export default router;

