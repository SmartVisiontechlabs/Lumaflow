import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';

export const authController = {
  async sendMagicLink(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    try {
      console.log(`[authController] Programmatic magic link requested for email: ${email}`);

      // 1. Check if user profile exists in user_profiles
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (profileErr) {
        console.error('[authController] Error fetching profile:', profileErr);
        throw profileErr;
      }

      if (!profile) {
        console.log(`[authController] No sanctuary account found for: ${email}`);
        return res.status(404).json({ 
          error: 'No sanctuary account was found associated with this email. Please reserve a ritual first to create your sanctuary.' 
        });
      }

      // 2. Generate programmatic login link
      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`;
      const loginUrl = await authService.generateAutoLoginLink(email.trim().toLowerCase(), redirectTo);

      if (!loginUrl) {
        throw new Error('Failed to generate secure sanctuary access link.');
      }

      const firstName = profile.full_name ? profile.full_name.split(' ')[0] : '';

      // 3. Dispatch email using Resend
      console.log(`[authController] Sending access email to: ${email} with link: ${loginUrl}`);
      await emailService.sendMagicLinkEmail(email.trim().toLowerCase(), profile.full_name || '', loginUrl);

      res.json({ 
        success: true, 
        message: 'Sanctuary access link dispatched successfully.',
        firstName
      });
    } catch (err: any) {
      console.error('[authController] Magic link generation failed:', err);
      res.status(500).json({ error: err.message || 'An error occurred while preparing your sanctuary link.' });
    }
  }
};
