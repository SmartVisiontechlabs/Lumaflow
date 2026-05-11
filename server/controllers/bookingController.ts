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
  }
};
