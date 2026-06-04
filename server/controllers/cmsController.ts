import { Request, Response } from 'express';
import { getSupabaseClient, supabaseAdmin } from '../config/supabase';
import fs from 'fs';
import path from 'path';

const getWriteClient = (req: Request) => {
  return supabaseAdmin || getSupabaseClient(req);
};


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
    console.log('CMS REQUEST START');
    const { title, subtitle, primary_cta_label, primary_cta_link, secondary_cta_label, secondary_cta_link } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);
      const { data: existingRow, error: findError } = await client
        .from('hero_content')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error('Supabase Error finding existing hero_content in updateHero:', findError);
      }

      const titleVal = title || '';
      const subtitleVal = subtitle || '';
      const primaryCtaLabelVal = primary_cta_label || '';
      const primaryCtaLinkVal = primary_cta_link || '/book';
      const secondaryCtaLabelVal = secondary_cta_label || '';
      const secondaryCtaLinkVal = secondary_cta_link || '#transformation-journey';

      console.log('SUPABASE UPDATE');
      let query;
      if (existingRow?.id) {
        query = client.from('hero_content').update({
          title: titleVal,
          subtitle: subtitleVal,
          primary_cta_label: primaryCtaLabelVal,
          primary_cta_link: primaryCtaLinkVal,
          secondary_cta_label: secondaryCtaLabelVal,
          secondary_cta_link: secondaryCtaLinkVal,
          updated_at: new Date().toISOString()
        }).eq('id', existingRow.id);
      } else {
        query = client.from('hero_content').insert({
          title: titleVal,
          subtitle: subtitleVal,
          primary_cta_label: primaryCtaLabelVal,
          primary_cta_link: primaryCtaLinkVal,
          secondary_cta_label: secondaryCtaLabelVal,
          secondary_cta_link: secondaryCtaLinkVal
        });
      }

      const { data, error } = await query.select().single();
      if (error) {
        console.error('Supabase Error [Table: hero_content] in updateHero:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateHero:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
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
    console.log('CMS REQUEST START');
    const id = req.params?.id || req.body?.id;
    const { step_number, title, subtitle, description, icon, sort_order, is_active } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);
      
      const stepNumberVal = step_number !== undefined ? parseInt(step_number) : 1;
      const titleVal = title || '';
      const subtitleVal = subtitle || '';
      const descriptionVal = description || '';
      const iconVal = icon || 'Wind';
      const sortOrderVal = sort_order !== undefined ? parseInt(sort_order) : 0;
      const isActiveVal = is_active !== false;

      console.log('SUPABASE UPDATE');
      const { data, error } = await client
        .from('transformation_steps')
        .update({
          step_number: stepNumberVal,
          title: titleVal,
          subtitle: subtitleVal,
          description: descriptionVal,
          icon: iconVal,
          sort_order: sortOrderVal,
          is_active: isActiveVal
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase Error [Table: transformation_steps] in updateStep:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateStep:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
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
    console.log('CMS REQUEST START');
    const { name, title, bio, credentials, quote, image_url, button_label, button_link } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);
      const { data: existingRow, error: findError } = await client
        .from('founder_bio')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error('Supabase Error finding existing founder_bio in updateFounder:', findError);
      }

      const nameVal = name || 'Alanna';
      const titleVal = title || '';
      const bioVal = bio || '';
      const credentialsVal = credentials || [];
      const quoteVal = quote || '';
      const imageUrlVal = image_url || '';
      const buttonLabelVal = button_label || '';
      const buttonLinkVal = button_link || '';

      console.log('SUPABASE UPDATE');
      let query;
      if (existingRow?.id) {
        query = client.from('founder_bio').update({
          name: nameVal,
          title: titleVal,
          bio: bioVal,
          credentials: credentialsVal,
          quote: quoteVal,
          image_url: imageUrlVal,
          button_label: buttonLabelVal,
          button_link: buttonLinkVal
        }).eq('id', existingRow.id);
      } else {
        query = client.from('founder_bio').insert({
          name: nameVal,
          title: titleVal,
          bio: bioVal,
          credentials: credentialsVal,
          quote: quoteVal,
          image_url: imageUrlVal,
          button_label: buttonLabelVal,
          button_link: buttonLinkVal
        });
      }

      const { data, error } = await query.select().single();
      if (error) {
        console.error('Supabase Error [Table: founder_bio] in updateFounder:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateFounder:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
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
    console.log('CMS REQUEST START');
    const { quote, author, sort_order, is_featured } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);
      
      const quoteVal = quote || '';
      const authorVal = author || '';
      const sortOrderVal = sort_order !== undefined ? parseInt(sort_order) : 0;
      const isFeaturedVal = is_featured === true;

      console.log('SUPABASE UPDATE');
      const { data, error } = await client
        .from('quotes')
        .insert({
          quote: quoteVal,
          author: authorVal,
          sort_order: sortOrderVal,
          is_featured: isFeaturedVal
        })
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: quotes] in createQuote:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(201).json(data);
    } catch (error: any) {
      console.error('Unexpected error in createQuote:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateQuote(req: Request, res: Response) {
    console.log('CMS REQUEST START');
    const id = req.params?.id || req.body?.id;
    const { quote, author, sort_order, is_featured } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);

      const quoteVal = quote || '';
      const authorVal = author || '';
      const sortOrderVal = sort_order !== undefined ? parseInt(sort_order) : 0;
      const isFeaturedVal = is_featured === true;

      console.log('SUPABASE UPDATE');
      const { data, error } = await client
        .from('quotes')
        .update({
          quote: quoteVal,
          author: authorVal,
          sort_order: sortOrderVal,
          is_featured: isFeaturedVal
        })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: quotes] in updateQuote:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateQuote:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async deleteQuote(req: Request, res: Response) {
    console.log('CMS REQUEST START');
    const id = req.params?.id || req.body?.id;
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);
      console.log('SUPABASE UPDATE');
      const { error } = await client.from('quotes').delete().eq('id', id);
      if (error) {
        console.error('Supabase Error [Table: quotes] in deleteQuote:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(204).send();
    } catch (error: any) {
      console.error('Unexpected error in deleteQuote:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
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
    console.log('CMS REQUEST START');
    const { client_name, review_text, program, is_featured, sort_order, rating } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);

      const clientNameVal = client_name || '';
      const reviewTextVal = review_text || '';
      const programVal = program || '';
      const isFeaturedVal = is_featured === true;
      const sortOrderVal = sort_order !== undefined ? parseInt(sort_order) : 0;
      const ratingVal = rating !== undefined ? parseInt(rating) : 5;

      console.log('SUPABASE UPDATE');
      const { data, error } = await client
        .from('reviews')
        .insert({
          client_name: clientNameVal,
          review_text: reviewTextVal,
          program: programVal,
          is_featured: isFeaturedVal,
          sort_order: sortOrderVal,
          rating: ratingVal
        })
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: reviews] in createReview:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(201).json(data);
    } catch (error: any) {
      console.error('Unexpected error in createReview:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateReview(req: Request, res: Response) {
    console.log('CMS REQUEST START');
    const id = req.params?.id || req.body?.id;
    const { client_name, review_text, program, is_featured, sort_order, rating } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);

      const clientNameVal = client_name || '';
      const reviewTextVal = review_text || '';
      const programVal = program || '';
      const isFeaturedVal = is_featured === true;
      const sortOrderVal = sort_order !== undefined ? parseInt(sort_order) : 0;
      const ratingVal = rating !== undefined ? parseInt(rating) : 5;

      console.log('SUPABASE UPDATE');
      const { data, error } = await client
        .from('reviews')
        .update({
          client_name: clientNameVal,
          review_text: reviewTextVal,
          program: programVal,
          is_featured: isFeaturedVal,
          sort_order: sortOrderVal,
          rating: ratingVal
        })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: reviews] in updateReview:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateReview:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async deleteReview(req: Request, res: Response) {
    console.log('CMS REQUEST START');
    const id = req.params?.id || req.body?.id;
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);
      console.log('SUPABASE UPDATE');
      const { error } = await client.from('reviews').delete().eq('id', id);
      if (error) {
        console.error('Supabase Error [Table: reviews] in deleteReview:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(204).send();
    } catch (error: any) {
      console.error('Unexpected error in deleteReview:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
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
    console.log('CMS REQUEST START');
    const { title, description, duration, price, image_url, is_featured, is_active, sort_order } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);

      const titleVal = title || '';
      const descriptionVal = description || '';
      const durationVal = duration !== undefined ? parseInt(duration) : 60;
      const priceVal = price !== undefined ? parseFloat(price) : 0;
      const imageUrlVal = image_url || '';
      const isFeaturedVal = is_featured === true;
      const isActiveVal = is_active !== false;
      const sortOrderVal = sort_order !== undefined ? parseInt(sort_order) : 0;

      console.log('SUPABASE UPDATE');
      const { data, error } = await client
        .from('offerings')
        .insert({
          title: titleVal,
          description: descriptionVal,
          duration: durationVal,
          price: priceVal,
          image_url: imageUrlVal,
          is_featured: isFeaturedVal,
          is_active: isActiveVal,
          sort_order: sortOrderVal
        })
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: offerings] in createOffering:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(201).json(data);
    } catch (error: any) {
      console.error('Unexpected error in createOffering:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async updateOffering(req: Request, res: Response) {
    console.log('CMS REQUEST START');
    const id = req.params?.id || req.body?.id;
    const { title, description, duration, price, image_url, is_featured, is_active, sort_order } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);

      const titleVal = title || '';
      const descriptionVal = description || '';
      const durationVal = duration !== undefined ? parseInt(duration) : 60;
      const priceVal = price !== undefined ? parseFloat(price) : 0;
      const imageUrlVal = image_url || '';
      const isFeaturedVal = is_featured === true;
      const isActiveVal = is_active !== false;
      const sortOrderVal = sort_order !== undefined ? parseInt(sort_order) : 0;

      console.log('SUPABASE UPDATE');
      const { data, error } = await client
        .from('offerings')
        .update({
          title: titleVal,
          description: descriptionVal,
          duration: durationVal,
          price: priceVal,
          image_url: imageUrlVal,
          is_featured: isFeaturedVal,
          is_active: isActiveVal,
          sort_order: sortOrderVal
        })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Supabase Error [Table: offerings] in updateOffering:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateOffering:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async deleteOffering(req: Request, res: Response) {
    console.log('CMS REQUEST START');
    const id = req.params?.id || req.body?.id;
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);
      console.log('SUPABASE UPDATE');
      const { error } = await client.from('offerings').delete().eq('id', id);
      if (error) {
        console.error('Supabase Error [Table: offerings] in deleteOffering:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(204).send();
    } catch (error: any) {
      console.error('Unexpected error in deleteOffering:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
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
    console.log('CMS REQUEST START');
    const id = req.params?.id || req.body?.id;
    const { journey, feeling, recommended_ritual, duration, recommended_plan, focus, confidence_score, is_active } = req.body || {};
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);

      const journeyVal = journey || '';
      const feelingVal = feeling || '';
      const recommendedRitualVal = recommended_ritual || '';
      const durationVal = duration !== undefined ? parseInt(duration) : 60;
      const recommendedPlanVal = recommended_plan || '';
      const focusVal = focus || '';
      const confidenceScoreVal = confidence_score || 'Highly Aligned';
      const isActiveVal = is_active !== false;

      console.log('SUPABASE UPDATE');
      const { data, error } = await client
        .from('intelligence_matrix')
        .update({
          journey: journeyVal,
          feeling: feelingVal,
          recommended_ritual: recommendedRitualVal,
          duration: durationVal,
          recommended_plan: recommendedPlanVal,
          focus: focusVal,
          confidence_score: confidenceScoreVal,
          is_active: isActiveVal
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase Error [Table: intelligence_matrix] in updateIntelligence:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('CMS RESPONSE SENT');
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Unexpected error in updateIntelligence:', error);
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  },

  async getPagesContent(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client.from('pages_content').select('*');
      if (error) {
        console.error('Supabase Error [Table: pages_content] in getPagesContent:', error);
        throw error;
      }
      
      const pagesMap: Record<string, any> = {};
      if (data) {
        data.forEach(item => {
          pagesMap[item.page_name] = item.content;
        });
      }
      
      // Ensure we have fallbacks for classes and contact pages
      if (!pagesMap.classes || !pagesMap.contact) {
        const fallbackPath = path.join(process.cwd(), 'server', 'data', 'cms_fallback.json');
        const fallbackRaw = fs.readFileSync(fallbackPath, 'utf8');
        const fallback = JSON.parse(fallbackRaw);
        if (!pagesMap.classes) pagesMap.classes = fallback.classes;
        if (!pagesMap.contact) pagesMap.contact = fallback.contact;
      }

      return res.json(pagesMap);
    } catch (error: any) {
      console.warn('getPagesContent falling back to cms_fallback.json due to error:', error.message || error);
      try {
        const fallbackPath = path.join(process.cwd(), 'server', 'data', 'cms_fallback.json');
        const fallbackRaw = fs.readFileSync(fallbackPath, 'utf8');
        const fallback = JSON.parse(fallbackRaw);
        return res.json({
          classes: fallback.classes,
          contact: fallback.contact
        });
      } catch (fallbackErr: any) {
        console.error('CRITICAL: Fallback loading failed in getPagesContent:', fallbackErr);
        return res.status(500).json({ error: error.message || 'Unexpected error' });
      }
    }
  },

  async updatePageContent(req: Request, res: Response) {
    console.log('CMS REQUEST START');
    const { page_name } = req.params;
    const { content } = req.body;
    try {
      console.log('AUTH COMPLETE');
      const client = getWriteClient(req);
      
      const { data: existing, error: fetchErr } = await client
        .from('pages_content')
        .select('id')
        .eq('page_name', page_name)
        .maybeSingle();

      if (fetchErr) {
        console.error('Supabase Error [Table: pages_content] checking existence in updatePageContent:', fetchErr);
        throw fetchErr;
      }

      const contentVal = content || {};

      console.log('SUPABASE UPDATE');
      let result;
      if (existing?.id) {
        result = await client
          .from('pages_content')
          .update({ content: contentVal, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await client
          .from('pages_content')
          .insert({ page_name, content: contentVal })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Supabase Error [Table: pages_content] in updatePageContent:', result.error);
        throw result.error;
      }

      console.log('CMS RESPONSE SENT');
      return res.status(200).json(result.data);
    } catch (error: any) {
      console.warn('updatePageContent falling back to local file due to error:', error.message || error);
      try {
        const fallbackPath = path.join(process.cwd(), 'server', 'data', 'cms_fallback.json');
        const fallbackRaw = fs.readFileSync(fallbackPath, 'utf8');
        const fallback = JSON.parse(fallbackRaw);
        
        fallback[page_name] = content;
        
        fs.writeFileSync(fallbackPath, JSON.stringify(fallback, null, 2), 'utf8');
        console.log(`Successfully updated local fallback content for page ${page_name}`);
        
        console.log('CMS RESPONSE SENT (FALLBACK)');
        return res.status(200).json({ page_name, content, fallback: true });
      } catch (fallbackErr: any) {
        console.error('CRITICAL: Fallback file write failed in updatePageContent:', fallbackErr);
        return res.status(500).json({ error: error.message || 'Unexpected error updating page content' });
      }
    }
  },

  async uploadImage(req: Request, res: Response) {
    console.log('CMS REQUEST START');
    try {
      console.log('AUTH COMPLETE');
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

      console.log('SUPABASE UPDATE'); // Simulates upload logic
      console.log('CMS RESPONSE SENT');
      return res.status(200).json({ path: `/uploads/${filename}` });
    } catch (error: any) {
      console.error('Image upload error:', error);
      return res.status(500).json({ error: 'Failed to upload image.' });
    }
  }
};
