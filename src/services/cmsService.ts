import { supabase } from '../lib/supabase';
import { 
  HeroContent, 
  TransformationStep, 
  FounderBio, 
  Quote, 
  Review, 
  Offering, 
  IntelligenceMatrixEntry 
} from '../types/cms';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ─── OFFLINE FALLBACKS ────────────────────────────────────────────────────────

const FALLBACK_HERO: HeroContent = {
  id: 'fallback-hero',
  title: 'Illuminate your\nhealing journey\nwith LumaFlow.',
  subtitle: 'Step into a luminous sanctuary of high-frequency somatic restoration, where ancient stillness meets the cutting edge of personal transformation. Here, we don\'t fix you—we help you remember who you are.',
  primary_cta_label: 'Begin Your Healing Journey',
  primary_cta_link: '/book',
  secondary_cta_label: 'Explore Healing Paths',
  secondary_cta_link: '#transformation-journey',
  updated_at: new Date().toISOString()
};

const FALLBACK_STEPS: TransformationStep[] = [
  { id: 'fallback-step-1', step_number: 1, title: 'Release', subtitle: 'Surrender & Empty', description: 'Let go of stored tension and shed the weight of expectations. Create a quiet, empty space within your body and mind.', icon: 'Wind', sort_order: 1, is_active: true },
  { id: 'fallback-step-2', step_number: 2, title: 'Reconnect', subtitle: 'Listen & Witness', description: 'Tune into the subtle rhythm of your breathing. Gently bring your awareness back to the organic wisdom of the present moment.', icon: 'Heart', sort_order: 2, is_active: true },
  { id: 'fallback-step-3', step_number: 3, title: 'Restore', subtitle: 'Nourish & Soften', description: 'Nourish your nervous system and re-align your natural frequencies. Sink into a state of deep, restorative rest.', icon: 'Sparkles', sort_order: 3, is_active: true },
  { id: 'fallback-step-4', step_number: 4, title: 'Illuminate', subtitle: 'Radiate & Expand', description: 'Step into your natural brightness and glow. Radiate peace, vitality, and heart-centered, creative clarity.', icon: 'Sun', sort_order: 4, is_active: true }
];

const FALLBACK_ABOUT: FounderBio = {
  id: 'fallback-about',
  name: 'Alanna',
  title: 'Meet Alanna',
  bio: 'Alanna is a somatic practitioner and guide devoted to helping you reconnect with your natural state of calm through breath, movement, and awareness. Certified Somatic & Breathwork Facilitator with 1,200+ hours of held container space.',
  quote: 'I created Lumaflow as a space where you don’t have to fix yourself — only remember who you are.',
  image_url: '/alanna-new.jpeg',
  button_label: 'Begin Your Journey',
  button_link: '/book'
};

const FALLBACK_QUOTES: Quote[] = [
  { id: 'fallback-quote-1', quote: 'Transforming negative energy into love and light.', author: 'Client Reflection', sort_order: 1, is_featured: true }
];

const FALLBACK_TESTIMONIALS: Review[] = [
  { id: 'fallback-test-1', client_name: 'Elena S.', program: 'Somatic Breathwork Client', review_text: 'Lumaflow changed my relationship with my own body. I finally feel at home in my own skin. The breathwork sessions are a sacred hour of pure, unfiltered return.', rating: 5, is_featured: false, sort_order: 1 },
  { id: 'fallback-test-2', client_name: 'Julian M.', program: 'Private Practice Integration', review_text: 'Walking into these sessions feels like leaving the weight of the world at the door. Alanna creates a container of unmatched safety, light, and grace.', rating: 5, is_featured: true, sort_order: 2 },
  { id: 'fallback-test-3', client_name: 'Sophia R.', program: 'Deep Meditation Immersion', review_text: 'A profound shift in my nervous system. After months of chronic stress, Lumaflow helped me locate a well of deep stillness I didn\'t know I still possessed.', rating: 5, is_featured: false, sort_order: 3 }
];

const FALLBACK_PATHS: Offering[] = [
  { id: 'fallback-path-1', title: 'Breathwork', description: 'Release held tension and emotional heaviness.', duration: 60, price: 150, image_url: '/breathwork.jpg', is_featured: false, is_active: true, sort_order: 1 },
  { id: 'fallback-path-2', title: 'Somatic Flow', description: 'Reconnect body awareness and nervous system ease.', duration: 90, price: 180, image_url: '/somatic.jpg', is_featured: true, is_active: true, sort_order: 2 },
  { id: 'fallback-path-3', title: 'Deep Meditation', description: 'Anchor into profound stillness and inner quiet.', duration: 60, price: 120, image_url: '/meditation.jpg', is_featured: false, is_active: true, sort_order: 3 }
];

// ─── AUTH HELPER ─────────────────────────────────────────────────────────────

async function getAuthHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (e) {
    console.error('CMS auth token extraction error:', e);
  }
  return headers;
}

// ─── SERVICE IMPLEMENTATION ──────────────────────────────────────────────────

export const cmsService = {
  /**
   * Fetch active hero content
   */
  async getHeroContent(): Promise<HeroContent> {
    try {
      const response = await fetch(`${API_URL}/cms/hero`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      return data || FALLBACK_HERO;
    } catch (e) {
      console.warn('CMS: Falling back for hero content', e);
      return FALLBACK_HERO;
    }
  },

  /**
   * Update hero content (Admin)
   */
  async updateHeroContent(id: string, content: Partial<HeroContent>): Promise<HeroContent> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/hero`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id, ...content })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update hero content');
    }
    return await response.json();
  },

  /**
   * Create new hero content (Admin)
   */
  async createHeroContent(content: Omit<HeroContent, 'id' | 'updated_at'>): Promise<HeroContent> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/hero`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(content)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create hero content');
    }
    return await response.json();
  },

  /**
   * Fetch active transformation steps
   */
  async getTransformationSteps(): Promise<TransformationStep[]> {
    try {
      const response = await fetch(`${API_URL}/cms/steps`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      return data && data.length > 0 ? data : FALLBACK_STEPS;
    } catch (e) {
      console.warn('CMS: Falling back for transformation steps', e);
      return FALLBACK_STEPS;
    }
  },

  /**
   * Update transformation step (Admin)
   */
  async updateTransformationStep(id: string, step: Partial<TransformationStep>): Promise<TransformationStep> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/steps/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(step)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update step');
    }
    return await response.json();
  },

  /**
   * Fetch Founder bio
   */
  async getAboutAlanna(): Promise<FounderBio> {
    try {
      const response = await fetch(`${API_URL}/cms/founder`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      return data || FALLBACK_ABOUT;
    } catch (e) {
      console.warn('CMS: Falling back for founder bio', e);
      return FALLBACK_ABOUT;
    }
  },

  /**
   * Update Founder bio (Admin)
   */
  async updateAboutAlanna(id: string, bio: Partial<FounderBio>): Promise<FounderBio> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/founder`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id, ...bio })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update founder bio');
    }
    return await response.json();
  },

  /**
   * Fetch quotes
   */
  async getQuotes(): Promise<Quote[]> {
    try {
      const response = await fetch(`${API_URL}/cms/quotes`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      return data && data.length > 0 ? data : FALLBACK_QUOTES;
    } catch (e) {
      console.warn('CMS: Falling back for quotes', e);
      return FALLBACK_QUOTES;
    }
  },

  /**
   * Update quote (Admin)
   */
  async updateQuote(id: string, quote: Partial<Quote>): Promise<Quote> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/quotes/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(quote)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update quote');
    }
    return await response.json();
  },

  /**
   * Add quote (Admin)
   */
  async createQuote(quote: Omit<Quote, 'id'>): Promise<Quote> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/quotes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(quote)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create quote');
    }
    return await response.json();
  },

  /**
   * Delete quote (Admin)
   */
  async deleteQuote(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/quotes/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete quote');
    }
  },

  /**
   * Fetch testimonials (reviews)
   */
  async getTestimonials(): Promise<Review[]> {
    try {
      const response = await fetch(`${API_URL}/cms/reviews`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      return data && data.length > 0 ? data : FALLBACK_TESTIMONIALS;
    } catch (e) {
      console.warn('CMS: Falling back for testimonials', e);
      return FALLBACK_TESTIMONIALS;
    }
  },

  /**
   * Update Testimonial (Admin)
   */
  async updateTestimonial(id: string, testimonial: Partial<Review>): Promise<Review> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/reviews/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(testimonial)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update testimonial');
    }
    return await response.json();
  },

  /**
   * Add Testimonial (Admin)
   */
  async createTestimonial(testimonial: Omit<Review, 'id'>): Promise<Review> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testimonial)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create testimonial');
    }
    return await response.json();
  },

  /**
   * Delete Testimonial (Admin)
   */
  async deleteTestimonial(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/reviews/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete testimonial');
    }
  },

  /**
   * Fetch active offerings/healing paths
   */
  async getHealingPaths(): Promise<Offering[]> {
    try {
      const response = await fetch(`${API_URL}/cms/offerings`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      return data && data.length > 0 ? data : FALLBACK_PATHS;
    } catch (e) {
      console.warn('CMS: Falling back for offerings', e);
      return FALLBACK_PATHS;
    }
  },

  /**
   * Update healing paths (Admin)
   */
  async updateHealingPath(id: string, path: Partial<Offering>): Promise<Offering> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/offerings/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(path)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update offering');
    }
    return await response.json();
  },

  /**
   * Fetch recommendation matrix from database
   */
  async getRecommendationMatrix(): Promise<IntelligenceMatrixEntry[]> {
    try {
      const response = await fetch(`${API_URL}/cms/intelligence`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      return data || [];
    } catch (e) {
      console.error('CMS Error fetching matrix:', e);
      return [];
    }
  },

  /**
   * Update recommendation matrix row (Admin)
   */
  async updateRecommendationMatrixEntry(id: string, entry: Partial<IntelligenceMatrixEntry>): Promise<IntelligenceMatrixEntry> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/intelligence/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(entry)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update matrix mapping');
    }
    return await response.json();
  }
};
