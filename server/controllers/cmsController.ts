import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';
import fs from 'fs';
import path from 'path';
import { getLocalFallbackData, saveLocalFallbackData } from '../utils/localCmsFallback';

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

      let hero = heroRes.data;
      if (heroRes.error) {
        console.error('Supabase Error [Table: hero_content] in getBatch:', {
          code: heroRes.error.code,
          message: heroRes.error.message,
          details: heroRes.error.details,
          hint: heroRes.error.hint
        });
        hero = getLocalFallbackData('hero_content');
      }

      let steps = stepsRes.data;
      if (stepsRes.error) {
        console.error('Supabase Error [Table: transformation_steps] in getBatch:', {
          code: stepsRes.error.code,
          message: stepsRes.error.message,
          details: stepsRes.error.details,
          hint: stepsRes.error.hint
        });
        steps = getLocalFallbackData('transformation_steps') || [];
      }

      let founder = founderRes.data;
      if (founderRes.error) {
        console.error('Supabase Error [Table: founder_bio] in getBatch:', {
          code: founderRes.error.code,
          message: founderRes.error.message,
          details: founderRes.error.details,
          hint: founderRes.error.hint
        });
        founder = getLocalFallbackData('founder_bio');
      }

      let quotes = quotesRes.data;
      if (quotesRes.error) {
        console.error('Supabase Error [Table: quotes] in getBatch:', {
          code: quotesRes.error.code,
          message: quotesRes.error.message,
          details: quotesRes.error.details,
          hint: quotesRes.error.hint
        });
        quotes = getLocalFallbackData('quotes') || [];
      }

      let reviews = reviewsRes.data;
      if (reviewsRes.error) {
        console.error('Supabase Error [Table: reviews] in getBatch:', {
          code: reviewsRes.error.code,
          message: reviewsRes.error.message,
          details: reviewsRes.error.details,
          hint: reviewsRes.error.hint
        });
        reviews = getLocalFallbackData('reviews') || [];
      }

      let offerings = offeringsRes.data;
      if (offeringsRes.error) {
        console.error('Supabase Error [Table: offerings] in getBatch:', {
          code: offeringsRes.error.code,
          message: offeringsRes.error.message,
          details: offeringsRes.error.details,
          hint: offeringsRes.error.hint
        });
        offerings = getLocalFallbackData('offerings') || [];
      }

      let intelligence = intelligenceRes.data;
      if (intelligenceRes.error) {
        console.error('Supabase Error [Table: intelligence_matrix] in getBatch:', {
          code: intelligenceRes.error.code,
          message: intelligenceRes.error.message,
          details: intelligenceRes.error.details,
          hint: intelligenceRes.error.hint
        });
        intelligence = getLocalFallbackData('intelligence_matrix') || [];
      }

      res.json({
        hero: hero || {},
        steps: steps || [],
        founder: founder || {},
        quotes: quotes || [],
        reviews: reviews || [],
        offerings: offerings || [],
        intelligence: intelligence || []
      });
    } catch (error) {
      console.error('Unexpected error loading CMS batch:', error);
      res.json({
        hero: getLocalFallbackData('hero_content') || {},
        steps: getLocalFallbackData('transformation_steps') || [],
        founder: getLocalFallbackData('founder_bio') || {},
        quotes: getLocalFallbackData('quotes') || [],
        reviews: getLocalFallbackData('reviews') || [],
        offerings: getLocalFallbackData('offerings') || [],
        intelligence: getLocalFallbackData('intelligence_matrix') || []
      });
    }
  },

  // Hero Content CRUD
  async getHero(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client.from('hero_content').select('*').maybeSingle();
      if (error) {
        console.error('Supabase Error [Table: hero_content] in getHero:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return res.json(getLocalFallbackData('hero_content'));
      }
      res.json(data || getLocalFallbackData('hero_content'));
    } catch (error) {
      console.error('Unexpected error in getHero:', error);
      res.json(getLocalFallbackData('hero_content'));
    }
  },

  async updateHero(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    const { title, subtitle, primary_cta_label, primary_cta_link, secondary_cta_label, secondary_cta_link } = req.body || {};
    try {
      const client = getSupabaseClient(req);
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
      if (error) {
        console.error('Supabase Error [Table: hero_content] in updateHero:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // Fallback save
        const saved = saveLocalFallbackData('hero_content', () => ({
          id: id || 'fallback-hero-id',
          title,
          subtitle,
          primary_cta_label,
          primary_cta_link,
          secondary_cta_label,
          secondary_cta_link,
          updated_at: new Date().toISOString()
        }));
        return res.json(saved);
      }
      res.json(data);
    } catch (error) {
      console.error('Unexpected error in updateHero:', error);
      const saved = saveLocalFallbackData('hero_content', () => ({
        id: id || 'fallback-hero-id',
        title,
        subtitle,
        primary_cta_label,
        primary_cta_link,
        secondary_cta_label,
        secondary_cta_link,
        updated_at: new Date().toISOString()
      }));
      res.json(saved);
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
        console.error('Supabase Error [Table: transformation_steps] in getSteps:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return res.json(getLocalFallbackData('transformation_steps') || []);
      }
      res.json(data && data.length > 0 ? data : (getLocalFallbackData('transformation_steps') || []));
    } catch (error) {
      console.error('Unexpected error in getSteps:', error);
      res.json(getLocalFallbackData('transformation_steps') || []);
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
        console.error('Supabase Error [Table: transformation_steps] in updateStep:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        const saved = saveLocalFallbackData('transformation_steps', (current: any[]) => {
          const idx = current.findIndex(s => s.id === id);
          const updatedStep = { id, step_number, title, subtitle, description, icon, sort_order, is_active };
          if (idx > -1) {
            current[idx] = updatedStep;
          } else {
            current.push(updatedStep);
          }
          return current;
        });
        const updatedItem = saved ? saved.find((s: any) => s.id === id) : null;
        return res.json(updatedItem || { id, step_number, title, subtitle, description, icon, sort_order, is_active });
      }
      res.json(data);
    } catch (error) {
      console.error('Unexpected error in updateStep:', error);
      const saved = saveLocalFallbackData('transformation_steps', (current: any[]) => {
        const idx = current.findIndex(s => s.id === id);
        const updatedStep = { id, step_number, title, subtitle, description, icon, sort_order, is_active };
        if (idx > -1) {
          current[idx] = updatedStep;
        } else {
          current.push(updatedStep);
        }
        return current;
      });
      const updatedItem = saved ? saved.find((s: any) => s.id === id) : null;
      res.json(updatedItem || { id, step_number, title, subtitle, description, icon, sort_order, is_active });
    }
  },

  // Founder Bio CRUD
  async getFounder(req: Request, res: Response) {
    try {
      const client = getSupabaseClient(req);
      const { data, error } = await client.from('founder_bio').select('*').maybeSingle();
      if (error) {
        console.error('Supabase Error [Table: founder_bio] in getFounder:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return res.json(getLocalFallbackData('founder_bio'));
      }
      res.json(data || getLocalFallbackData('founder_bio'));
    } catch (error) {
      console.error('Unexpected error in getFounder:', error);
      res.json(getLocalFallbackData('founder_bio'));
    }
  },

  async updateFounder(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    const { name, title, bio, credentials, quote, image_url, button_label, button_link } = req.body || {};
    try {
      const client = getSupabaseClient(req);

      let query;
      if (id) {
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
        query = client.from('founder_bio').update(updateData).eq('id', id);
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
        console.error('Supabase Error [Table: founder_bio] in updateFounder:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Fallback save
        const saved = saveLocalFallbackData('founder_bio', (current: any) => {
          const updatedFounder = {
            id: id || current?.id || 'fallback-founder-id',
            name: name !== undefined && name !== null && name !== '' ? name : (current?.name || 'Alanna'),
            title: title !== undefined ? title : current?.title,
            bio: bio !== undefined ? bio : current?.bio,
            credentials: credentials !== undefined ? credentials : current?.credentials,
            quote: quote !== undefined ? quote : current?.quote,
            image_url: image_url !== undefined ? image_url : current?.image_url,
            button_label: button_label !== undefined ? button_label : current?.button_label,
            button_link: button_link !== undefined ? button_link : current?.button_link
          };
          return updatedFounder;
        });
        return res.json(saved);
      }
      res.json(data);
    } catch (error) {
      console.error('Unexpected error in updateFounder:', error);
      const saved = saveLocalFallbackData('founder_bio', (current: any) => {
        const updatedFounder = {
          id: id || current?.id || 'fallback-founder-id',
          name: name !== undefined && name !== null && name !== '' ? name : (current?.name || 'Alanna'),
          title: title !== undefined ? title : current?.title,
          bio: bio !== undefined ? bio : current?.bio,
          credentials: credentials !== undefined ? credentials : current?.credentials,
          quote: quote !== undefined ? quote : current?.quote,
          image_url: image_url !== undefined ? image_url : current?.image_url,
          button_label: button_label !== undefined ? button_label : current?.button_label,
          button_link: button_link !== undefined ? button_link : current?.button_link
        };
        return updatedFounder;
      });
      res.json(saved);
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
        console.error('Supabase Error [Table: quotes] in getQuotes:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return res.json(getLocalFallbackData('quotes') || []);
      }
      res.json(data && data.length > 0 ? data : (getLocalFallbackData('quotes') || []));
    } catch (error) {
      console.error('Unexpected error in getQuotes:', error);
      res.json(getLocalFallbackData('quotes') || []);
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
        console.error('Supabase Error [Table: quotes] in createQuote:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Fallback save
        const newId = `fallback-quote-${Date.now()}`;
        const newQuote = { id: newId, quote, author, sort_order, is_featured };
        saveLocalFallbackData('quotes', (current: any[]) => {
          current.push(newQuote);
          return current;
        });
        return res.status(201).json(newQuote);
      }
      res.status(201).json(data);
    } catch (error) {
      console.error('Unexpected error in createQuote:', error);
      const newId = `fallback-quote-${Date.now()}`;
      const newQuote = { id: newId, quote, author, sort_order, is_featured };
      saveLocalFallbackData('quotes', (current: any[]) => {
        current.push(newQuote);
        return current;
      });
      res.status(201).json(newQuote);
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
        console.error('Supabase Error [Table: quotes] in updateQuote:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        const saved = saveLocalFallbackData('quotes', (current: any[]) => {
          const idx = current.findIndex(q => q.id === id);
          const updatedQuote = { id, quote, author, sort_order, is_featured };
          if (idx > -1) {
            current[idx] = updatedQuote;
          } else {
            current.push(updatedQuote);
          }
          return current;
        });
        const updatedItem = saved ? saved.find((q: any) => q.id === id) : null;
        return res.json(updatedItem || { id, quote, author, sort_order, is_featured });
      }
      res.json(data);
    } catch (error) {
      console.error('Unexpected error in updateQuote:', error);
      const saved = saveLocalFallbackData('quotes', (current: any[]) => {
        const idx = current.findIndex(q => q.id === id);
        const updatedQuote = { id, quote, author, sort_order, is_featured };
        if (idx > -1) {
          current[idx] = updatedQuote;
        } else {
          current.push(updatedQuote);
        }
        return current;
      });
      const updatedItem = saved ? saved.find((q: any) => q.id === id) : null;
      res.json(updatedItem || { id, quote, author, sort_order, is_featured });
    }
  },

  async deleteQuote(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    try {
      const client = getSupabaseClient(req);
      const { error } = await client.from('quotes').delete().eq('id', id);
      if (error) {
        console.error('Supabase Error [Table: quotes] in deleteQuote:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        saveLocalFallbackData('quotes', (current: any[]) => {
          return current.filter(q => q.id !== id);
        });
        return res.status(204).send();
      }
      res.status(204).send();
    } catch (error) {
      console.error('Unexpected error in deleteQuote:', error);
      saveLocalFallbackData('quotes', (current: any[]) => {
        return current.filter(q => q.id !== id);
      });
      res.status(204).send();
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
        console.error('Supabase Error [Table: reviews] in getReviews:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return res.json(getLocalFallbackData('reviews') || []);
      }
      res.json(data && data.length > 0 ? data : (getLocalFallbackData('reviews') || []));
    } catch (error) {
      console.error('Unexpected error in getReviews:', error);
      res.json(getLocalFallbackData('reviews') || []);
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
        console.error('Supabase Error [Table: reviews] in createReview:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // Fallback save
        const newId = `fallback-review-${Date.now()}`;
        const newReview = { id: newId, client_name, review_text, program, is_featured, sort_order, rating };
        saveLocalFallbackData('reviews', (current: any[]) => {
          current.push(newReview);
          return current;
        });
        return res.status(201).json(newReview);
      }
      res.status(201).json(data);
    } catch (error) {
      console.error('Unexpected error in createReview:', error);
      const newId = `fallback-review-${Date.now()}`;
      const newReview = { id: newId, client_name, review_text, program, is_featured, sort_order, rating };
      saveLocalFallbackData('reviews', (current: any[]) => {
        current.push(newReview);
        return current;
      });
      res.status(201).json(newReview);
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
        console.error('Supabase Error [Table: reviews] in updateReview:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        const saved = saveLocalFallbackData('reviews', (current: any[]) => {
          const idx = current.findIndex(r => r.id === id);
          const updatedReview = { id, client_name, review_text, program, is_featured, sort_order, rating };
          if (idx > -1) {
            current[idx] = updatedReview;
          } else {
            current.push(updatedReview);
          }
          return current;
        });
        const updatedItem = saved ? saved.find((r: any) => r.id === id) : null;
        return res.json(updatedItem || { id, client_name, review_text, program, is_featured, sort_order, rating });
      }
      res.json(data);
    } catch (error) {
      console.error('Unexpected error in updateReview:', error);
      const saved = saveLocalFallbackData('reviews', (current: any[]) => {
        const idx = current.findIndex(r => r.id === id);
        const updatedReview = { id, client_name, review_text, program, is_featured, sort_order, rating };
        if (idx > -1) {
          current[idx] = updatedReview;
        } else {
          current.push(updatedReview);
        }
        return current;
      });
      const updatedItem = saved ? saved.find((r: any) => r.id === id) : null;
      res.json(updatedItem || { id, client_name, review_text, program, is_featured, sort_order, rating });
    }
  },

  async deleteReview(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    try {
      const client = getSupabaseClient(req);
      const { error } = await client.from('reviews').delete().eq('id', id);
      if (error) {
        console.error('Supabase Error [Table: reviews] in deleteReview:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        saveLocalFallbackData('reviews', (current: any[]) => {
          return current.filter(r => r.id !== id);
        });
        return res.status(204).send();
      }
      res.status(204).send();
    } catch (error) {
      console.error('Unexpected error in deleteReview:', error);
      saveLocalFallbackData('reviews', (current: any[]) => {
        return current.filter(r => r.id !== id);
      });
      res.status(204).send();
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
        console.error('Supabase Error [Table: offerings] in getOfferings:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return res.json(getLocalFallbackData('offerings') || []);
      }
      res.json(data && data.length > 0 ? data : (getLocalFallbackData('offerings') || []));
    } catch (error) {
      console.error('Unexpected error in getOfferings:', error);
      res.json(getLocalFallbackData('offerings') || []);
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
        console.error('Supabase Error [Table: offerings] in createOffering:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        const newId = `fallback-offering-${Date.now()}`;
        const newOffering = { id: newId, title, description, duration, price, image_url, is_featured, is_active, sort_order };
        saveLocalFallbackData('offerings', (current: any[]) => {
          current.push(newOffering);
          return current;
        });
        return res.status(201).json(newOffering);
      }
      res.status(201).json(data);
    } catch (error) {
      console.error('Unexpected error in createOffering:', error);
      const newId = `fallback-offering-${Date.now()}`;
      const newOffering = { id: newId, title, description, duration, price, image_url, is_featured, is_active, sort_order };
      saveLocalFallbackData('offerings', (current: any[]) => {
        current.push(newOffering);
        return current;
      });
      res.status(201).json(newOffering);
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
        console.error('Supabase Error [Table: offerings] in updateOffering:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        const saved = saveLocalFallbackData('offerings', (current: any[]) => {
          const idx = current.findIndex(o => o.id === id);
          const updatedOffering = { id, title, description, duration, price, image_url, is_featured, is_active, sort_order };
          if (idx > -1) {
            current[idx] = updatedOffering;
          } else {
            current.push(updatedOffering);
          }
          return current;
        });
        const updatedItem = saved ? saved.find((o: any) => o.id === id) : null;
        return res.json(updatedItem || { id, title, description, duration, price, image_url, is_featured, is_active, sort_order });
      }
      res.json(data);
    } catch (error) {
      console.error('Unexpected error in updateOffering:', error);
      const saved = saveLocalFallbackData('offerings', (current: any[]) => {
        const idx = current.findIndex(o => o.id === id);
        const updatedOffering = { id, title, description, duration, price, image_url, is_featured, is_active, sort_order };
        if (idx > -1) {
          current[idx] = updatedOffering;
        } else {
          current.push(updatedOffering);
        }
        return current;
      });
      const updatedItem = saved ? saved.find((o: any) => o.id === id) : null;
      res.json(updatedItem || { id, title, description, duration, price, image_url, is_featured, is_active, sort_order });
    }
  },

  async deleteOffering(req: Request, res: Response) {
    const id = req.params?.id || req.body?.id;
    try {
      const client = getSupabaseClient(req);
      const { error } = await client.from('offerings').delete().eq('id', id);
      if (error) {
        console.error('Supabase Error [Table: offerings] in deleteOffering:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        saveLocalFallbackData('offerings', (current: any[]) => {
          return current.filter(o => o.id !== id);
        });
        return res.status(204).send();
      }
      res.status(204).send();
    } catch (error) {
      console.error('Unexpected error in deleteOffering:', error);
      saveLocalFallbackData('offerings', (current: any[]) => {
        return current.filter(o => o.id !== id);
      });
      res.status(204).send();
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
        console.error('Supabase Error [Table: intelligence_matrix] in getIntelligence:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return res.json(getLocalFallbackData('intelligence_matrix') || []);
      }
      res.json(data && data.length > 0 ? data : (getLocalFallbackData('intelligence_matrix') || []));
    } catch (error) {
      console.error('Unexpected error in getIntelligence:', error);
      res.json(getLocalFallbackData('intelligence_matrix') || []);
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
        console.error('Supabase Error [Table: intelligence_matrix] in updateIntelligence:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        const saved = saveLocalFallbackData('intelligence_matrix', (current: any[]) => {
          const idx = current.findIndex(i => i.id === id);
          const updatedIntelligence = { id, journey, feeling, recommended_ritual, duration, recommended_plan, focus, confidence_score, is_active };
          if (idx > -1) {
            current[idx] = updatedIntelligence;
          } else {
            current.push(updatedIntelligence);
          }
          return current;
        });
        const updatedItem = saved ? saved.find((i: any) => i.id === id) : null;
        return res.json(updatedItem || { id, journey, feeling, recommended_ritual, duration, recommended_plan, focus, confidence_score, is_active });
      }
      res.json(data);
    } catch (error) {
      console.error('Unexpected error in updateIntelligence:', error);
      const saved = saveLocalFallbackData('intelligence_matrix', (current: any[]) => {
        const idx = current.findIndex(i => i.id === id);
        const updatedIntelligence = { id, journey, feeling, recommended_ritual, duration, recommended_plan, focus, confidence_score, is_active };
        if (idx > -1) {
          current[idx] = updatedIntelligence;
        } else {
          current.push(updatedIntelligence);
        }
        return current;
      });
      const updatedItem = saved ? saved.find((i: any) => i.id === id) : null;
      res.json(updatedItem || { id, journey, feeling, recommended_ritual, duration, recommended_plan, focus, confidence_score, is_active });
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
