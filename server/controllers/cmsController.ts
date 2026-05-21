import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';

export const cmsController = {
  // Batch get all CMS content (public read)
  async getBatch(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const [
        heroRes,
        stepsRes,
        founderRes,
        quotesRes,
        reviewsRes,
        offeringsRes,
        intelligenceRes
      ] = await Promise.all([
        client.from('hero_content').select('*').maybeSingle(),
        client.from('transformation_steps').select('*').order('sort_order', { ascending: true }),
        client.from('founder_bio').select('*').maybeSingle(),
        client.from('quotes').select('*').order('sort_order', { ascending: true }),
        client.from('reviews').select('*').order('sort_order', { ascending: true }),
        client.from('offerings').select('*').order('sort_order', { ascending: true }),
        client.from('intelligence_matrix').select('*').eq('is_active', true)
      ]);

      if (
        heroRes.error ||
        stepsRes.error ||
        founderRes.error ||
        quotesRes.error ||
        reviewsRes.error ||
        offeringsRes.error ||
        intelligenceRes.error
      ) {
        console.error('CMS Batch Fetch Error details:', {
          hero: heroRes.error,
          steps: stepsRes.error,
          founder: founderRes.error,
          quotes: quotesRes.error,
          reviews: reviewsRes.error,
          offerings: offeringsRes.error,
          intelligence: intelligenceRes.error
        });
        return res.status(500).json({ error: 'Failed to retrieve sanctuary content.' });
      }

      res.json({
        hero: heroRes.data,
        steps: stepsRes.data,
        founder: founderRes.data,
        quotes: quotesRes.data,
        reviews: reviewsRes.data,
        offerings: offeringsRes.data,
        intelligence: intelligenceRes.data
      });
    } catch (error) {
      console.error('CMS batch error:', error);
      res.status(500).json({ error: 'Unexpected error loading sanctuary systems.' });
    }
  },

  // Hero Content CRUD
  async getHero(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client.from('hero_content').select('*').maybeSingle();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve hero configuration.' });
    }
  },

  async updateHero(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id, title, subtitle, primary_cta_label, primary_cta_link, secondary_cta_label, secondary_cta_link } = req.body;
      
      let query;
      if (id) {
        query = client.from('hero_content').update({
          title,
          subtitle,
          primary_cta_label,
          primary_cta_link,
          secondary_cta_label,
          secondary_cta_link,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } else {
        query = client.from('hero_content').insert({
          title,
          subtitle,
          primary_cta_label,
          primary_cta_link,
          secondary_cta_label,
          secondary_cta_link
        });
      }

      const { data, error } = await query.select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update hero configuration.' });
    }
  },

  // Transformation Steps CRUD
  async getSteps(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('transformation_steps')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve transformation steps.' });
    }
  },

  async updateStep(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id } = req.params;
      const { step_number, title, subtitle, description, icon, sort_order, is_active } = req.body;

      const { data, error } = await client
        .from('transformation_steps')
        .update({
          step_number,
          title,
          subtitle,
          description,
          icon,
          sort_order,
          is_active
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update transformation step.' });
    }
  },

  // Founder Bio CRUD
  async getFounder(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client.from('founder_bio').select('*').maybeSingle();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve founder bio.' });
    }
  },

  async updateFounder(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id, name, title, bio, quote, image_url, button_label, button_link } = req.body;

      let query;
      if (id) {
        query = client.from('founder_bio').update({
          name,
          title,
          bio,
          quote,
          image_url,
          button_label,
          button_link
        }).eq('id', id);
      } else {
        query = client.from('founder_bio').insert({
          name,
          title,
          bio,
          quote,
          image_url,
          button_label,
          button_link
        });
      }

      const { data, error } = await query.select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update founder bio.' });
    }
  },

  // Quotes CRUD
  async getQuotes(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('quotes')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve quotes.' });
    }
  },

  async createQuote(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { quote, author, sort_order, is_featured } = req.body;
      const { data, error } = await client
        .from('quotes')
        .insert({ quote, author, sort_order, is_featured })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to archive quote.' });
    }
  },

  async updateQuote(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id } = req.params;
      const { quote, author, sort_order, is_featured } = req.body;
      const { data, error } = await client
        .from('quotes')
        .update({ quote, author, sort_order, is_featured })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update quote.' });
    }
  },

  async deleteQuote(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id } = req.params;
      const { error } = await client.from('quotes').delete().eq('id', id);
      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to remove quote.' });
    }
  },

  // Reviews CRUD
  async getReviews(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('reviews')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve reviews.' });
    }
  },

  async createReview(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { client_name, review_text, program, is_featured, sort_order, rating } = req.body;
      const { data, error } = await client
        .from('reviews')
        .insert({ client_name, review_text, program, is_featured, sort_order, rating })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create review.' });
    }
  },

  async updateReview(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id } = req.params;
      const { client_name, review_text, program, is_featured, sort_order, rating } = req.body;
      const { data, error } = await client
        .from('reviews')
        .update({ client_name, review_text, program, is_featured, sort_order, rating })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update review.' });
    }
  },

  async deleteReview(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id } = req.params;
      const { error } = await client.from('reviews').delete().eq('id', id);
      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete review.' });
    }
  },

  // Offerings CRUD
  async getOfferings(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('offerings')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve offerings.' });
    }
  },

  async createOffering(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { title, description, duration, price, image_url, is_featured, is_active, sort_order } = req.body;
      const { data, error } = await client
        .from('offerings')
        .insert({ title, description, duration, price, image_url, is_featured, is_active, sort_order })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create offering.' });
    }
  },

  async updateOffering(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id } = req.params;
      const { title, description, duration, price, image_url, is_featured, is_active, sort_order } = req.body;
      const { data, error } = await client
        .from('offerings')
        .update({ title, description, duration, price, image_url, is_featured, is_active, sort_order })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update offering.' });
    }
  },

  async deleteOffering(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id } = req.params;
      const { error } = await client.from('offerings').delete().eq('id', id);
      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete offering.' });
    }
  },

  // Intelligence Matrix CRUD
  async getIntelligence(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('intelligence_matrix')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve intelligence mapping.' });
    }
  },

  async updateIntelligence(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { id } = req.params;
      const { journey, feeling, recommended_ritual, duration, recommended_plan, focus, confidence_score, is_active } = req.body;

      const { data, error } = await client
        .from('intelligence_matrix')
        .update({
          journey,
          feeling,
          recommended_ritual,
          duration,
          recommended_plan,
          focus,
          confidence_score,
          is_active
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to align intelligence mapping.' });
    }
  }
};
