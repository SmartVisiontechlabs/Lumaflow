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
  },

  async block(req: Request, res: Response) {
    try {
      const data = await availabilityService.blockSlot(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to manifest sanctuary stillness.' });
    }
  },

  async unblock(req: Request, res: Response) {
    try {
      await availabilityService.unblockSlot(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to restore sanctuary availability.' });
    }
  },

  async listBlocked(req: Request, res: Response) {
    try {
      const { start, end } = req.query;
      const data = await availabilityService.getBlockedSlots(start as string, end as string);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve sanctuary blocks.' });
    }
  }
};
