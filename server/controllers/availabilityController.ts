import { Request, Response } from 'express';
import { availabilityService } from '../services/availabilityService';

export const availabilityController = {
  async get(req: Request, res: Response) {
    try {
      const { date, duration } = req.query;
      
      if (!date || !duration) {
        return res.status(400).json({ error: 'Date and duration are required for attunement.' });
      }

      const slots = await availabilityService.getAvailability(
        date as string, 
        parseInt(duration as string)
      );

      res.json(slots);
    } catch (error) {
      res.status(500).json({ error: 'Chronological availability could not be retrieved.' });
    }
  }
};
