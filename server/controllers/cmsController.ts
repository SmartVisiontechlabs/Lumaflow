import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';
import fs from 'fs';
import path from 'path';

export const cmsController = {
  // Batch get all CMS content (public read)
  async getBatch(req: Request, res: Response) {
    console.log('[CMS LOAD] Starting batch fetch...');
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

      const hasError = !!(
        heroRes.error ||
        stepsRes.error ||
        founderRes.error ||
        quotesRes.error ||
        reviewsRes.error ||
        offeringsRes.error ||
        intelligenceRes.error
      );

      if (hasError) {
        const errors = {
          hero: heroRes.error?.message,
          steps: stepsRes.error?.message,
          founder: founderRes.error?.message,
          quotes: quotesRes.error?.message,
          reviews: reviewsRes.error?.message,
          offerings: offeringsRes.error?.message,
          intelligence: intelligenceRes.error?.message
        };
        console.error('[CMS LOAD] Database query failed. Exact reasons:', JSON.stringify(errors, null, 2));
        console.log('[CMS LOAD] Resolving with local cms_fallback.json file content...');

        const fallbackPath = path.join(process.cwd(), 'server', 'data', 'cms_fallback.json');
        const fallbackRaw = fs.readFileSync(fallbackPath, 'utf8');
        const fallback = JSON.parse(fallbackRaw);

        console.log('[CMS LOAD] Fallback resolved successfully.');
        return res.json({
          hero: fallback.hero_content || {},
          steps: fallback.transformation_steps || [],
          founder: fallback.founder_bio || {},
          quotes: fallback.quotes || [],
          reviews: fallback.reviews || [],
          offerings: fallback.offerings || [],
          intelligence: fallback.intelligence_matrix || []
        });
      }

      console.log('[CMS LOAD] Successfully loaded CMS content from Supabase database.');
      res.json({
        hero: heroRes.data || {},
        steps: stepsRes.data || [],
        founder: founderRes.data || {},
        quotes: quotesRes.data || [],
        reviews: reviewsRes.data || [],
        offerings: offeringsRes.data || [],
        intelligence: intelligenceRes.data || []
      });
    } catch (error: any) {
      console.error('[CMS LOAD] Unexpected error during fetch. Failure reason:', error.message || error);
      console.log('[CMS LOAD] Attempting local JSON fallback retrieval...');
      try {
        const fallbackPath = path.join(process.cwd(), 'server', 'data', 'cms_fallback.json');
        const fallbackRaw = fs.readFileSync(fallbackPath, 'utf8');
        const fallback = JSON.parse(fallbackRaw);
        console.log('[CMS LOAD] Fallback resolved successfully after unexpected exception.');
        return res.json({
          hero: fallback.hero_content || {},
          steps: fallback.transformation_steps || [],
          founder: fallback.founder_bio || {},
          quotes: fallback.quotes || [],
          reviews: fallback.reviews || [],
          offerings: fallback.offerings || [],
          intelligence: fallback.intelligence_matrix || []
        });
      } catch (fallbackErr: any) {
        console.error('[CMS LOAD] CRITICAL: Fallback JSON failed to load:', fallbackErr.message || fallbackErr);
        res.status(500).json({ error: error.message || 'Unexpected error loading CMS batch' });
      }
    }
  },

  // Hero Content CRUD
  async getHero(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client.from('hero_content').select('*').maybeSingle();
      if (error) {
        console.error('Supabase Error [Table: hero_content] in getHero:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data || {});
    } catch (error: any) {
      console.error('Unexpected error in getHero:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateHero(req: Request, res: Response) {
    const { title, subtitle, primary_cta_label, primary_cta_link, secondary_cta_label, secondary_cta_link } = req.body || {};
    try {
      const client = getSupabaseClient(req);
      const { data: existingRow, error: findError } = await client
        .from('hero_content')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error('Supabase Error finding existing hero_content in updateHero:', findError);
      }

      let query;
      if (existingRow?.id) {
        query = client.from('hero_content').update({
          title,
          subtitle,
          primary_cta_label,
          primary_cta_link,
          secondary_cta_label,
          secondary_cta_link,
          updated_at: new Date().toISOString()
        }).eq('id', existingRow.id);
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
      if (error) {
        console.error('Supabase Error [Table: hero_content] in updateHero:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateHero:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
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
      if (error) {
        console.error('Supabase Error [Table: transformation_steps] in getSteps:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data || []);
    } catch (error: any) {
      console.error('Unexpected error in getSteps:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateStep(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    const { step_number, title, subtitle, description, icon, sort_order, is_active } = req.body || {};
    try {
      const client = getSupabaseClient(req);
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

      if (error) {
        console.error('Supabase Error [Table: transformation_steps] in updateStep:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateStep:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  // Founder Bio CRUD
  async getFounder(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client.from('founder_bio').select('*').maybeSingle();
      if (error) {
        console.error('Supabase Error [Table: founder_bio] in getFounder:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data || {});
    } catch (error: any) {
      console.error('Unexpected error in getFounder:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateFounder(req: Request, res: Response) {
    const { name, title, bio, credentials, quote, image_url, button_label, button_link } = req.body || {};
    try {
      const client = getSupabaseClient(req);
      const { data: existingRow, error: findError } = await client
        .from('founder_bio')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error('Supabase Error finding existing founder_bio in updateFounder:', findError);
      }

      let query;
      if (existingRow?.id) {
        const updateData: any = {
          title,
          bio,
          credentials,
          quote,
          image_url,
          button_label,
          button_link
        };
        if (name !== undefined && name !== null && name !== '') {
          updateData.name = name;
        }
        query = client.from('founder_bio').update(updateData).eq('id', existingRow.id);
      } else {
        const insertData = {
          name: name || 'Alanna',
          title,
          bio,
          credentials: credentials || [],
          quote,
          image_url,
          button_label,
          button_link
        };
        query = client.from('founder_bio').insert(insertData);
      }

      const { data, error } = await query.select().single();
      if (error) {
        console.error('Supabase Error [Table: founder_bio] in updateFounder:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateFounder:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
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
      if (error) {
        console.error('Supabase Error [Table: quotes] in getQuotes:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data || []);
    } catch (error: any) {
      console.error('Unexpected error in getQuotes:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async createQuote(req: Request, res: Response) {
    const { quote, author, sort_order, is_featured } = req.body || {};
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('quotes')
        .insert({ quote, author, sort_order, is_featured })
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: quotes] in createQuote:', error);
        return res.status(500).json({ error: error.message });
      }
      res.status(201).json(data);
    } catch (error: any) {
      console.error('Unexpected error in createQuote:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateQuote(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    const { quote, author, sort_order, is_featured } = req.body || {};
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('quotes')
        .update({ quote, author, sort_order, is_featured })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: quotes] in updateQuote:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateQuote:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async deleteQuote(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    try {
      const client = getSupabaseClient(req);
      const { error } = await client.from('quotes').delete().eq('id', id);
      if (error) {
        console.error('Supabase Error [Table: quotes] in deleteQuote:', error);
        return res.status(500).json({ error: error.message });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Unexpected error in deleteQuote:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
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
      if (error) {
        console.error('Supabase Error [Table: reviews] in getReviews:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data || []);
    } catch (error: any) {
      console.error('Unexpected error in getReviews:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async createReview(req: Request, res: Response) {
    const { client_name, review_text, program, is_featured, sort_order, rating } = req.body || {};
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('reviews')
        .insert({ client_name, review_text, program, is_featured, sort_order, rating })
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: reviews] in createReview:', error);
        return res.status(500).json({ error: error.message });
      }
      res.status(201).json(data);
    } catch (error: any) {
      console.error('Unexpected error in createReview:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateReview(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    const { client_name, review_text, program, is_featured, sort_order, rating } = req.body || {};
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('reviews')
        .update({ client_name, review_text, program, is_featured, sort_order, rating })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: reviews] in updateReview:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateReview:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async deleteReview(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    try {
      const client = getSupabaseClient(req);
      const { error } = await client.from('reviews').delete().eq('id', id);
      if (error) {
        console.error('Supabase Error [Table: reviews] in deleteReview:', error);
        return res.status(500).json({ error: error.message });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Unexpected error in deleteReview:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
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
      if (error) {
        console.error('Supabase Error [Table: offerings] in getOfferings:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data || []);
    } catch (error: any) {
      console.error('Unexpected error in getOfferings:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async createOffering(req: Request, res: Response) {
    const { title, description, duration, price, image_url, is_featured, is_active, sort_order } = req.body || {};
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('offerings')
        .insert({ title, description, duration, price, image_url, is_featured, is_active, sort_order })
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: offerings] in createOffering:', error);
        return res.status(500).json({ error: error.message });
      }
      res.status(201).json(data);
    } catch (error: any) {
      console.error('Unexpected error in createOffering:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateOffering(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    const { title, description, duration, price, image_url, is_featured, is_active, sort_order } = req.body || {};
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client
        .from('offerings')
        .update({ title, description, duration, price, image_url, is_featured, is_active, sort_order })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: offerings] in updateOffering:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateOffering:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async deleteOffering(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    try {
      const client = getSupabaseClient(req);
      const { error } = await client.from('offerings').delete().eq('id', id);
      if (error) {
        console.error('Supabase Error [Table: offerings] in deleteOffering:', error);
        return res.status(500).json({ error: error.message });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Unexpected error in deleteOffering:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
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
      if (error) {
        console.error('Supabase Error [Table: intelligence_matrix] in getIntelligence:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data || []);
    } catch (error: any) {
      console.error('Unexpected error in getIntelligence:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateIntelligence(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    const { journey, feeling, recommended_ritual, duration, recommended_plan, focus, confidence_score, is_active } = req.body || {};
    try {
      const client = getSupabaseClient(req);
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

      if (error) {
        console.error('Supabase Error [Table: intelligence_matrix] in updateIntelligence:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateIntelligence:', error);
      res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async uploadImage(req: Request, res: Response) {
    try {
      const { image } = req.body || {}; // Base64 encoded string
      if (!image) {
        return res.status(400).json({ error: 'No image data provided.' });
      }

      // Check if image is base64 format (e.g. data:image/jpeg;base64,...)
      const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid image format.' });
      }

      const imageType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate a unique filename
      const filename = `founder-portrait-${Date.now()}.${imageType === 'png' ? 'png' : 'jpg'}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      // Return the URL path
      res.json({ path: `/uploads/${filename}` });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image.' });
    }
  }
};
