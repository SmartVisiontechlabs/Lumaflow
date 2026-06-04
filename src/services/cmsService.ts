import { adminSupabase as supabase } from '../lib/supabase';
import { 
  HeroContent, 
  TransformationStep, 
  FounderBio, 
  Quote, 
  Review, 
  Offering, 
  IntelligenceMatrixEntry 
} from '../types/cms';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

// ─── AUTH HELPER ─────────────────────────────────────────────────────────────

async function getAuthHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const { data: { session } } = await supabase.auth.getSession();
  
  console.log('CMS Session:', session);
  
  if (!session || !session.access_token) {
    throw new Error('No authorization header provided');
  }
  
  headers['Authorization'] = `Bearer ${session.access_token}`;
  
  console.log('CMS Headers:', headers);
  return headers;
}

// ─── SERVICE IMPLEMENTATION ──────────────────────────────────────────────────

export const cmsService = {
  /**
   * Fetch all CMS content in one batch request
   */
  async getBatchContent(): Promise<{
    hero: HeroContent;
    steps: TransformationStep[];
    founder: FounderBio;
    quotes: Quote[];
    reviews: Review[];
    offerings: Offering[];
    intelligence: IntelligenceMatrixEntry[];
  }> {
    const response = await fetch(`${API_URL}/cms`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch CMS batch content');
    }
    return await response.json();
  },

  /**
   * Fetch active hero content
   */
  async getHeroContent(): Promise<HeroContent> {
    const response = await fetch(`${API_URL}/cms/hero`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch hero content');
    }
    return await response.json();
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
      const err = await response.json().catch(() => ({}));
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
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create hero content');
    }
    return await response.json();
  },

  /**
   * Fetch active transformation steps
   */
  async getTransformationSteps(): Promise<TransformationStep[]> {
    const response = await fetch(`${API_URL}/cms/steps`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch transformation steps');
    }
    return await response.json();
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
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update step');
    }
    return await response.json();
  },

  /**
   * Fetch Founder bio
   */
  async getAboutAlanna(): Promise<FounderBio> {
    const response = await fetch(`${API_URL}/cms/founder`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch founder bio');
    }
    return await response.json();
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
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update founder bio');
    }
    return await response.json();
  },

  /**
   * Fetch quotes
   */
  async getQuotes(): Promise<Quote[]> {
    const response = await fetch(`${API_URL}/cms/quotes`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch quotes');
    }
    return await response.json();
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
      const err = await response.json().catch(() => ({}));
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
      const err = await response.json().catch(() => ({}));
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
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete quote');
    }
  },

  /**
   * Fetch testimonials (reviews)
   */
  async getTestimonials(): Promise<Review[]> {
    const response = await fetch(`${API_URL}/cms/reviews`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch testimonials');
    }
    return await response.json();
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
      const err = await response.json().catch(() => ({}));
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
      const err = await response.json().catch(() => ({}));
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
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete testimonial');
    }
  },

  /**
   * Fetch active offerings/healing paths
   */
  async getHealingPaths(): Promise<Offering[]> {
    const response = await fetch(`${API_URL}/cms/offerings`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch offerings');
    }
    return await response.json();
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
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update offering');
    }
    return await response.json();
  },

  /**
   * Fetch recommendation matrix from database
   */
  async getRecommendationMatrix(): Promise<IntelligenceMatrixEntry[]> {
    const response = await fetch(`${API_URL}/cms/intelligence`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch matrix mappings');
    }
    return await response.json();
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
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update matrix mapping');
    }
    return await response.json();
  },

  /**
   * Fetch all pages custom configs
   */
  async getPagesContent(): Promise<Record<string, any>> {
    const response = await fetch(`${API_URL}/cms/pages`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch pages content');
    }
    return await response.json();
  },

  /**
   * Update a specific page custom config
   */
  async updatePageContent(page_name: string, content: any): Promise<any> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/cms/pages/${page_name}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ content })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update page content');
    }
    return await response.json();
  }
};
