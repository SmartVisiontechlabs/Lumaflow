import { Request, Response } from 'express';
import { bookingService } from '../services/bookingService';

export const bookingController = {
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
