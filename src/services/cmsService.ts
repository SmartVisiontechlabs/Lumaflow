import { supabase } from '../lib/supabase';
import { 
  HeroContent, 
  HomepageSection, 
  TransformationStep, 
  AboutAlanna, 
  Quote, 
  Testimonial, 
  HealingPath, 
  RecommendationMatrixEntry 
} from '../types/cms';

// ─── OFFLINE FALLBACKS ────────────────────────────────────────────────────────

const FALLBACK_HERO: HeroContent = {
  id: 'fallback-hero',
  headline: 'Illuminate your\nhealing journey\nwith LumaFlow.',
  subheadline: 'Step into a luminous sanctuary of high-frequency somatic restoration, where ancient stillness meets the cutting edge of personal transformation. Here, we don\'t fix you—we help you remember who you are.',
  cta_text: 'Begin Your Healing Journey',
  cta_link: '/book',
  secondary_cta_text: 'Explore Healing Paths',
  secondary_cta_link: '#transformation-journey',
  background_visual_url: null,
  is_active: true,
  updated_at: new Date().toISOString()
};

const FALLBACK_SECTIONS: HomepageSection[] = [
  { id: 'fallback-sec-1', section_key: 'hero', title: 'Hero Section', subtitle: 'A Sacred Space for Awakening', display_order: 1, is_visible: true, metadata: {}, updated_at: new Date().toISOString() },
  { id: 'fallback-sec-2', section_key: 'transformation', title: 'Path to Transformation', subtitle: 'The Journey', display_order: 2, is_visible: true, metadata: {}, updated_at: new Date().toISOString() },
  { id: 'fallback-sec-3', section_key: 'about', title: 'Meet Alanna', subtitle: 'THE HEART BEHIND LUMAFLOW', display_order: 3, is_visible: true, metadata: {}, updated_at: new Date().toISOString() },
  { id: 'fallback-sec-4', section_key: 'quote', title: 'Client Reflection', subtitle: 'Wisdom', display_order: 4, is_visible: true, metadata: {}, updated_at: new Date().toISOString() },
  { id: 'fallback-sec-5', section_key: 'testimonials', title: 'Stories of Transformation', subtitle: 'Testimonials', display_order: 5, is_visible: true, metadata: {}, updated_at: new Date().toISOString() },
  { id: 'fallback-sec-6', section_key: 'programs', title: 'Journeys to inner calm', subtitle: 'Our Offerings', display_order: 6, is_visible: true, metadata: {}, updated_at: new Date().toISOString() }
];

const FALLBACK_STEPS: TransformationStep[] = [
  { id: 'fallback-step-1', step_number: 1, title: 'Release', subtitle: 'Surrender & Empty', description: 'Let go of stored tension and shed the weight of expectations. Create a quiet, empty space within your body and mind.', icon_name: 'Wind', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fallback-step-2', step_number: 2, title: 'Reconnect', subtitle: 'Listen & Witness', description: 'Tune into the subtle rhythm of your breathing. Gently bring your awareness back to the organic wisdom of the present moment.', icon_name: 'Heart', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fallback-step-3', step_number: 3, title: 'Restore', subtitle: 'Nourish & Soften', description: 'Nourish your nervous system and re-align your natural frequencies. Sink into a state of deep, restorative rest.', icon_name: 'Sparkles', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fallback-step-4', step_number: 4, title: 'Illuminate', subtitle: 'Radiate & Expand', description: 'Step into your natural brightness and glow. Radiate peace, vitality, and heart-centered, creative clarity.', icon_name: 'Sun', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const FALLBACK_ABOUT: AboutAlanna = {
  id: 'fallback-about',
  photo_url: '/alanna-new.jpeg',
  bio_title: 'Meet Alanna',
  quote: 'I created Lumaflow as a space where you don’t have to fix yourself — only remember who you are.',
  bio_body: 'Alanna is a somatic practitioner and guide devoted to helping you reconnect with your natural state of calm through breath, movement, and awareness.',
  credentials: ['Certified Somatic & Breathwork Facilitator', '1,200+ Hours of Held Container Space'],
  cta_label: 'Begin Your Journey',
  cta_link: '/book',
  updated_at: new Date().toISOString()
};

const FALLBACK_QUOTES: Quote[] = [
  { id: 'fallback-quote-1', quote_text: 'Transforming negative energy into love and light.', author_text: 'Client Reflection', is_active: true, display_order: 1, created_at: new Date().toISOString() }
];

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: 'fallback-test-1', name: 'Elena S.', role: 'Somatic Breathwork Client', quote: 'Lumaflow changed my relationship with my own body. I finally feel at home in my own skin. The breathwork sessions are a sacred hour of pure, unfiltered return.', rating: 5, is_featured: false, is_active: true, display_order: 1, created_at: new Date().toISOString() },
  { id: 'fallback-test-2', name: 'Julian M.', role: 'Private Practice Integration', quote: 'Walking into these sessions feels like leaving the weight of the world at the door. Alanna creates a container of unmatched safety, light, and grace.', rating: 5, is_featured: true, is_active: true, display_order: 2, created_at: new Date().toISOString() },
  { id: 'fallback-test-3', name: 'Sophia R.', role: 'Deep Meditation Immersion', quote: 'A profound shift in my nervous system. After months of chronic stress, Lumaflow helped me locate a well of deep stillness I didn\'t know I still possessed.', rating: 5, is_featured: false, is_active: true, display_order: 3, created_at: new Date().toISOString() }
];

const FALLBACK_PATHS: HealingPath[] = [
  { id: 'fallback-path-1', title: 'Breathwork', slug: 'breathwork', benefit: 'Release held tension and emotional heaviness.', duration_minutes: 60, price: 150, cta_text: 'Begin Journey', display_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'fallback-path-2', title: 'Somatic Flow', slug: 'somatic-flow', benefit: 'Reconnect body awareness and nervous system ease.', duration_minutes: 90, price: 180, cta_text: 'Begin Journey', display_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'fallback-path-3', title: 'Deep Meditation', slug: 'deep-meditation', benefit: 'Anchor into profound stillness and inner quiet.', duration_minutes: 60, price: 120, cta_text: 'Begin Journey', display_order: 3, is_active: true, created_at: new Date().toISOString() }
];

// ─── SERVICE IMPLEMENTATION ──────────────────────────────────────────────────

export const cmsService = {
  /**
   * Fetch active hero content
   */
  async getHeroContent(): Promise<HeroContent> {
    try {
      if (!supabase) return FALLBACK_HERO;
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.warn('CMS: Falling back for hero content', error);
        return FALLBACK_HERO;
      }
      return data as HeroContent;
    } catch (e) {
      console.error('CMS Error fetching hero:', e);
      return FALLBACK_HERO;
    }
  },

  /**
   * Update hero content (Admin)
   */
  async updateHeroContent(id: string, content: Partial<HeroContent>): Promise<HeroContent> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('hero_content')
      .update({ ...content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as HeroContent;
  },

  /**
   * Create new hero content (Admin)
   */
  async createHeroContent(content: Omit<HeroContent, 'id' | 'updated_at'>): Promise<HeroContent> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('hero_content')
      .insert([content])
      .select()
      .single();

    if (error) throw error;
    return data as HeroContent;
  },

  /**
   * Fetch all homepage section visibility rules
   */
  async getHomepageSections(): Promise<HomepageSection[]> {
    try {
      if (!supabase) return FALLBACK_SECTIONS;
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('CMS: Falling back for homepage sections');
        return FALLBACK_SECTIONS;
      }
      return data as HomepageSection[];
    } catch (e) {
      console.error('CMS Error fetching sections:', e);
      return FALLBACK_SECTIONS;
    }
  },

  /**
   * Update homepage section configurations
   */
  async updateHomepageSection(sectionKey: string, section: Partial<HomepageSection>): Promise<HomepageSection> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('homepage_sections')
      .update({ ...section, updated_at: new Date().toISOString() })
      .eq('section_key', sectionKey)
      .select()
      .single();

    if (error) throw error;
    return data as HomepageSection;
  },

  /**
   * Fetch active transformation steps
   */
  async getTransformationSteps(): Promise<TransformationStep[]> {
    try {
      if (!supabase) return FALLBACK_STEPS;
      const { data, error } = await supabase
        .from('transformation_steps')
        .select('*')
        .eq('is_active', true)
        .order('step_number', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('CMS: Falling back for transformation steps');
        return FALLBACK_STEPS;
      }
      return data as TransformationStep[];
    } catch (e) {
      console.error('CMS Error fetching transformation steps:', e);
      return FALLBACK_STEPS;
    }
  },

  /**
   * Update transformation steps (Admin)
   */
  async updateTransformationStep(id: string, step: Partial<TransformationStep>): Promise<TransformationStep> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('transformation_steps')
      .update({ ...step, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TransformationStep;
  },

  /**
   * Fetch Alanna bio
   */
  async getAboutAlanna(): Promise<AboutAlanna> {
    try {
      if (!supabase) return FALLBACK_ABOUT;
      const { data, error } = await supabase
        .from('about_alanna')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.warn('CMS: Falling back for about alanna');
        return FALLBACK_ABOUT;
      }
      return data as AboutAlanna;
    } catch (e) {
      console.error('CMS Error fetching about alanna:', e);
      return FALLBACK_ABOUT;
    }
  },

  /**
   * Update About Alanna (Admin)
   */
  async updateAboutAlanna(id: string, bio: Partial<AboutAlanna>): Promise<AboutAlanna> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('about_alanna')
      .update({ ...bio, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AboutAlanna;
  },

  /**
   * Fetch quotes
   */
  async getQuotes(): Promise<Quote[]> {
    try {
      if (!supabase) return FALLBACK_QUOTES;
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('CMS: Falling back for quotes');
        return FALLBACK_QUOTES;
      }
      return data as Quote[];
    } catch (e) {
      console.error('CMS Error fetching quotes:', e);
      return FALLBACK_QUOTES;
    }
  },

  /**
   * Update quote (Admin)
   */
  async updateQuote(id: string, quote: Partial<Quote>): Promise<Quote> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('quotes')
      .update(quote)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Quote;
  },

  /**
   * Add quote (Admin)
   */
  async createQuote(quote: Omit<Quote, 'id' | 'created_at'>): Promise<Quote> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('quotes')
      .insert([quote])
      .select()
      .single();

    if (error) throw error;
    return data as Quote;
  },

  /**
   * Fetch testimonials
   */
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      if (!supabase) return FALLBACK_TESTIMONIALS;
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('CMS: Falling back for testimonials');
        return FALLBACK_TESTIMONIALS;
      }
      return data as Testimonial[];
    } catch (e) {
      console.error('CMS Error fetching testimonials:', e);
      return FALLBACK_TESTIMONIALS;
    }
  },

  /**
   * Update Testimonial (Admin)
   */
  async updateTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('testimonials')
      .update(testimonial)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Testimonial;
  },

  /**
   * Add Testimonial (Admin)
   */
  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at'>): Promise<Testimonial> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('testimonials')
      .insert([testimonial])
      .select()
      .single();

    if (error) throw error;
    return data as Testimonial;
  },

  /**
   * Fetch active offerings/healing paths
   */
  async getHealingPaths(): Promise<HealingPath[]> {
    try {
      if (!supabase) return FALLBACK_PATHS;
      const { data, error } = await supabase
        .from('healing_paths')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('CMS: Falling back for healing paths');
        return FALLBACK_PATHS;
      }
      return data as HealingPath[];
    } catch (e) {
      console.error('CMS Error fetching healing paths:', e);
      return FALLBACK_PATHS;
    }
  },

  /**
   * Update healing paths (Admin)
   */
  async updateHealingPath(id: string, path: Partial<HealingPath>): Promise<HealingPath> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('healing_paths')
      .update(path)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as HealingPath;
  },

  /**
   * Fetch recommendation matrix from database
   */
  async getRecommendationMatrix(): Promise<RecommendationMatrixEntry[]> {
    try {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('recommendation_matrix')
        .select('*')
        .eq('is_active', true);

      if (error || !data) {
        console.warn('CMS: Error fetching recommendation matrix, falling back to static');
        return [];
      }
      return data as RecommendationMatrixEntry[];
    } catch (e) {
      console.error('CMS Error fetching matrix:', e);
      return [];
    }
  },

  /**
   * Update recommendation matrix row (Admin)
   */
  async updateRecommendationMatrixEntry(id: string, entry: Partial<RecommendationMatrixEntry>): Promise<RecommendationMatrixEntry> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('recommendation_matrix')
      .update(entry)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as RecommendationMatrixEntry;
  }
};
