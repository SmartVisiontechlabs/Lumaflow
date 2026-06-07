import { Request, Response } from 'express';
import { bookingService } from '../services/bookingService';
import { supabaseAdmin } from '../config/supabase';
import { sanitizeInput } from '../utils/sanitize';

export const bookingController = {
  async checkEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      console.log(`[bookingController] Checking account existence for email: ${email}`);
      const client = supabaseAdmin || require('../config/supabase').supabase;
      const { data: userId, error } = await client.rpc('get_user_id_by_email', {
        email_to_check: email
      });

      if (error) {
        console.error('[bookingController] Error checking email existence:', error);
        return res.status(500).json({ error: 'Failed to verify account status.' });
      }

      res.json({ exists: !!userId });
    } catch (error: any) {
      console.error('[bookingController] Unexpected error checking email:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
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
      if (req.body.fullName) req.body.fullName = sanitizeInput(req.body.fullName);
      if (req.body.intentions) req.body.intentions = sanitizeInput(req.body.intentions);
      const data = await bookingService.createBooking(req.body);
      res.status(201).json(data);
    } catch (error) {
      console.error('Booking Controller Error:', error);
      res.status(500).json({ error: 'Your sanctuary could not be secured. Please try again gently.' });
    }
  },

  async createDraft(req: Request, res: Response) {
    try {
      if (req.body.fullName) req.body.fullName = sanitizeInput(req.body.fullName);
      if (req.body.intentions) req.body.intentions = sanitizeInput(req.body.intentions);
      const data = await bookingService.createDraftBooking(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      console.error('[bookingController] createDraft error:', error);
      res.status(500).json({ error: error.message || 'Failed to create booking draft.' });
    }
  },

  async confirmCredit(req: Request, res: Response) {
    try {
      const { bookingId } = req.body;
      const userId = (req as any).user.id;
      const data = await bookingService.confirmCreditBooking(bookingId, userId);
      res.json(data);
    } catch (error: any) {
      console.error('[bookingController] confirmCredit error:', error);
      res.status(500).json({ error: error.message || 'Failed to confirm credit booking.' });
    }
  },

  async getActiveDraft(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = await bookingService.getActiveDraftBooking(userId);
      res.json(data);
    } catch (error: any) {
      console.error('[bookingController] getActiveDraft error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve active draft.' });
    }
  },

  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = await bookingService.getBookingsHistory(userId);
      res.json(data);
    } catch (error: any) {
      console.error('[bookingController] getHistory error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve booking history.' });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const client = supabaseAdmin || require('../config/supabase').supabase;
      const { data: profile, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[bookingController] getProfile error:', error);
        return res.status(500).json({ error: 'Failed to retrieve profile.' });
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found.' });
      }

      res.json(profile);
    } catch (error: any) {
      console.error('[bookingController] Unexpected error in getProfile:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
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
  },

  async regenerateZoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await bookingService.regenerateZoomForBooking(id);
      res.json({ success: true, booking: data });
    } catch (error: any) {
      console.error('[bookingController] regenerateZoom error:', error);
      res.status(500).json({ error: error.message || 'Failed to regenerate Zoom meeting.' });
    }
  }
};
