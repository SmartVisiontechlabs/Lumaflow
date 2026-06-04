import { Request, Response } from 'express';
import { bookingService } from '../services/bookingService';
import { supabaseAdmin } from '../config/supabase';

export const bookingController = {
  async checkEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      console.log(`[bookingController] Checking account existence for email: ${email}`);
      // Fallback to supabase if admin client is null
      const client = supabaseAdmin || require('../config/supabase').supabase;
      const { data: userId, error } = await client.rpc('get_user_id_by_email', {
        email_to_check: email
      });

      if (error) {
        console.error('[bookingController] Error checking email existence:', error);
        return res.status(500).json({ error: 'Failed to verify account status.' });
      }

      res.json({ exists: !!userId, userId: userId || null });
    } catch (error: any) {
      console.error('[bookingController] Unexpected error checking email:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async restoreSession(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      console.log(`[bookingController] Silent session restore requested for: ${email}`);

      // 1. Verify user exists
      const client = supabaseAdmin || require('../config/supabase').supabase;
      const { data: userId, error: lookupErr } = await client.rpc('get_user_id_by_email', {
        email_to_check: email
      });

      if (lookupErr) {
        console.error('[bookingController] restoreSession lookup error:', lookupErr);
        return res.status(500).json({ error: 'Failed to verify account identity.' });
      }

      if (!userId) {
        return res.status(404).json({ error: 'Sanctuary account not found.' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Administrative services unavailable for silent login.' });
      }

      // 2. Generate secure magic link
      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard`;
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo }
      });

      if (linkErr || !linkData?.properties?.action_link) {
        console.error('[bookingController] Error generating magic link for silent restore:', linkErr);
        return res.status(500).json({ error: 'Failed to generate secure credentials.' });
      }

      const actionLink = linkData.properties.action_link;
      console.log('[bookingController] Silent link generated. Exchanging...');

      // 3. Silently fetch the action link on the backend to intercept the redirect
      const fetchResponse = await fetch(actionLink, {
        method: 'GET',
        redirect: 'manual'
      });

      const location = fetchResponse.headers.get('location');
      if (!location) {
        console.error('[bookingController] No redirect location returned by Supabase Auth verify');
        return res.status(500).json({ error: 'Secure credentials exchange failed.' });
      }

      // 4. Parse hash fragment from location header
      const hashIndex = location.indexOf('#');
      if (hashIndex === -1) {
        console.error('[bookingController] No hash parameters found in redirect location:', location);
        return res.status(500).json({ error: 'Authentication exchange returned invalid token format.' });
      }

      const hash = location.substring(hashIndex + 1);
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token || !refresh_token) {
        console.error('[bookingController] Missing tokens in redirect location hash');
        return res.status(500).json({ error: 'Restoration tokens not found.' });
      }

      console.log('[bookingController] Silent session tokens successfully retrieved.');
      res.json({ access_token, refresh_token });
    } catch (error: any) {
      console.error('[bookingController] Unexpected error in restoreSession:', error);
      res.status(500).json({ error: error.message || 'Unexpected session restore failure.' });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const data = await bookingService.getAllBookings();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve sanctuary records.' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = await bookingService.createBooking(req.body);
      res.status(201).json(data);
    } catch (error) {
      console.error('Booking Controller Error:', error);
      res.status(500).json({ error: 'Your sanctuary could not be secured. Please try again gently.' });
    }
  },

  async createDraft(req: Request, res: Response) {
    try {
      const data = await bookingService.createDraftBooking(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      console.error('[bookingController] createDraft error:', error);
      res.status(500).json({ error: error.message || 'Failed to create booking draft.' });
    }
  },

  async confirmCredit(req: Request, res: Response) {
    try {
      const { bookingId, userId } = req.body;
      const data = await bookingService.confirmCreditBooking(bookingId, userId);
      res.json(data);
    } catch (error: any) {
      console.error('[bookingController] confirmCredit error:', error);
      res.status(500).json({ error: error.message || 'Failed to confirm credit booking.' });
    }
  },

  async getActiveDraft(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      const data = await bookingService.getActiveDraftBooking(userId as string);
      res.json(data);
    } catch (error: any) {
      console.error('[bookingController] getActiveDraft error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve active draft.' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const data = await bookingService.updateBooking(req.params.id, req.body);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to refine sanctuary record.' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await bookingService.deleteBooking(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to archive sanctuary record.' });
    }
  },

  async sendRitual(req: Request, res: Response) {
    const { bookingId, clientEmail, clientName, rituals, adminNote } = req.body;
    try {
      const result = await bookingService.sendRitualEmail(bookingId, clientEmail, clientName, rituals, adminNote);
      res.json(result);
    } catch (error) {
      console.error('Ritual Email Error:', error);
      res.status(500).json({ error: 'Failed to share integration ritual.' });
    }
  }
};
