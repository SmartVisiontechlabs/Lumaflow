import { create } from 'zustand';
import { cmsService } from '../services/cmsService';
import {
  HeroContent,
  TransformationStep,
  FounderBio,
  Quote,
  Review,
  Offering,
  IntelligenceMatrixEntry
} from '../types/cms';

export interface CmsState {
  hero: HeroContent | null;
  steps: TransformationStep[];
  founder: FounderBio | null;
  quotes: Quote[];
  testimonials: Review[];
  offerings: Offering[];
  intelligence: IntelligenceMatrixEntry[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;

  fetchCMS: () => Promise<void>;
  refetchCMS: () => Promise<void>;
}

const FALLBACK_DATA = {
  hero: {
    id: "fallback-hero-id",
    title: "Illuminate your \nhealing journey\nwith LumaFlow.",
    subtitle: "Step into a luminous sanctuary of high-frequency somatic restoration, where ancient stillness meets the cutting edge of personal transformation. Here, we don't fix you—we help you remember who you are.",
    primary_cta_label: "Begin Your Healing Journey",
    primary_cta_link: "/book",
    secondary_cta_label: "Explore Healing Paths",
    secondary_cta_link: "#transformation-journey"
  },
  steps: [
    {
      id: "fallback-step-1",
      step_number: 1,
      title: "Release",
      subtitle: "Surrender & Empty",
      description: "Let go of stored tension and shed the weight of expectations. Create a quiet, empty space within your body and mind.",
      icon: "Wind",
      sort_order: 1,
      is_active: true
    },
    {
      id: "fallback-step-2",
      step_number: 2,
      title: "Reconnect",
      subtitle: "Listen & Witness",
      description: "Tune into the subtle rhythm of your breathing. Gently bring your awareness back to the organic wisdom of the present moment.",
      icon: "Heart",
      sort_order: 2,
      is_active: true
    },
    {
      id: "fallback-step-3",
      step_number: 3,
      title: "Restore",
      subtitle: "Nourish & Soften",
      description: "Nourish your nervous system and re-align your natural frequencies. Sink into a state of deep, restorative rest.",
      icon: "Sparkles",
      sort_order: 3,
      is_active: true
    },
    {
      id: "fallback-step-4",
      step_number: 4,
      title: "Illuminate",
      subtitle: "Radiate & Expand",
      description: "Step into your natural brightness and glow. Radiate peace, vitality, and heart-centered, creative clarity.",
      icon: "Sun",
      sort_order: 4,
      is_active: true
    }
  ],
  founder: {
    id: "fallback-founder-id",
    name: "Alanna",
    title: "Meet Alanna",
    bio: "Alanna is a somatic practitioner and guide devoted to helping you reconnect with your natural state of calm through breath, movement, and awareness.",
    credentials: [
      "Certified Somatic Facilitator",
      "Breathwork Practitioner (1,200+ Hours)"
    ],
    quote: "I created Lumaflow as a space where you don’t have to fix yourself — only remember who you are.",
    image_url: "/alanna-new.jpeg",
    button_label: "Begin Your Journey",
    button_link: "/book"
  },
  quotes: [
    {
      id: "fallback-quote-1",
      quote: "Transforming negative energy into love and light.",
      author: "Client Reflection",
      sort_order: 1,
      is_featured: true
    }
  ],
  testimonials: [
    {
      id: "fallback-review-1",
      client_name: "Elena S.",
      "review_text": "Lumaflow changed my relationship with my own body. I finally feel at home in my own skin. The breathwork sessions are a sacred hour of pure, unfiltered return.",
      program: "Somatic Breathwork Client",
      is_featured: false,
      sort_order: 1,
      rating: 5
    },
    {
      id: "fallback-review-2",
      client_name: "Julian M.",
      "review_text": "Walking into these sessions feels like leaving the weight of the world at the door. Alanna creates a container of unmatched safety, light, and grace.",
      program: "Private Practice Integration",
      is_featured: true,
      sort_order: 2,
      rating: 5
    },
    {
      id: "fallback-review-3",
      client_name: "Sophia R.",
      "review_text": "A profound shift in my nervous system. After months of chronic stress, Lumaflow helped me locate a well of deep stillness I didn't know I still possessed.",
      program: "Deep Meditation Immersion",
      is_featured: false,
      sort_order: 3,
      rating: 5
    }
  ],
  offerings: [
    {
      id: "fallback-offering-1",
      title: "Breathwork",
      description: "Release held tension and emotional heaviness.",
      duration: 60,
      price: 150,
      image_url: "/breathwork.jpg",
      is_featured: false,
      is_active: true,
      sort_order: 1
    },
    {
      id: "fallback-offering-2",
      title: "Somatic Flow",
      description: "Reconnect body awareness and nervous system ease.",
      duration: 90,
      price: 180,
      image_url: "/somatic.jpg",
      is_featured: true,
      is_active: true,
      sort_order: 2
    },
    {
      id: "fallback-offering-3",
      title: "Deep Meditation",
      description: "Anchor into profound stillness and inner quiet.",
      duration: 60,
      price: 120,
      image_url: "/meditation.jpg",
      is_featured: false,
      is_active: true,
      sort_order: 3
    }
  ],
  intelligence: []
};

export const useCmsStore = create<CmsState>((set, get) => ({
  hero: null,
  steps: [],
  founder: null,
  quotes: [],
  testimonials: [],
  offerings: [],
  intelligence: [],
  isLoading: false,
  error: null,
  hasLoaded: false,

  fetchCMS: async () => {
    // Only fetch if not already loaded or if there's an error
    if (get().hasLoaded && !get().error) return;

    set({ isLoading: true, error: null });
    try {
      const data = await cmsService.getBatchContent();
      const hasHero = data.hero && typeof data.hero === 'object' && Object.keys(data.hero).length > 0;
      const hasFounder = data.founder && typeof data.founder === 'object' && Object.keys(data.founder).length > 0;
      
      set({
        hero: hasHero ? data.hero : FALLBACK_DATA.hero,
        steps: data.steps && data.steps.length > 0 ? data.steps : FALLBACK_DATA.steps,
        founder: hasFounder ? data.founder : FALLBACK_DATA.founder,
        quotes: data.quotes && data.quotes.length > 0 ? data.quotes : FALLBACK_DATA.quotes,
        testimonials: data.reviews && data.reviews.length > 0 ? data.reviews : FALLBACK_DATA.testimonials,
        offerings: data.offerings && data.offerings.length > 0 ? data.offerings : FALLBACK_DATA.offerings,
        intelligence: data.intelligence && data.intelligence.length > 0 ? data.intelligence : FALLBACK_DATA.intelligence,
        isLoading: false,
        hasLoaded: true,
        error: null
      });
    } catch (err: any) {
      console.error('Error fetching CMS batch content, applying fallback:', err);
      set({
        hero: FALLBACK_DATA.hero,
        steps: FALLBACK_DATA.steps,
        founder: FALLBACK_DATA.founder,
        quotes: FALLBACK_DATA.quotes,
        testimonials: FALLBACK_DATA.testimonials,
        offerings: FALLBACK_DATA.offerings,
        intelligence: FALLBACK_DATA.intelligence,
        isLoading: false,
        hasLoaded: true,
        error: err.message || 'Failed to fetch sanctuary content.'
      });
    }
  },

  refetchCMS: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await cmsService.getBatchContent();
      const hasHero = data.hero && typeof data.hero === 'object' && Object.keys(data.hero).length > 0;
      const hasFounder = data.founder && typeof data.founder === 'object' && Object.keys(data.founder).length > 0;

      set({
        hero: hasHero ? data.hero : FALLBACK_DATA.hero,
        steps: data.steps && data.steps.length > 0 ? data.steps : FALLBACK_DATA.steps,
        founder: hasFounder ? data.founder : FALLBACK_DATA.founder,
        quotes: data.quotes && data.quotes.length > 0 ? data.quotes : FALLBACK_DATA.quotes,
        testimonials: data.reviews && data.reviews.length > 0 ? data.reviews : FALLBACK_DATA.testimonials,
        offerings: data.offerings && data.offerings.length > 0 ? data.offerings : FALLBACK_DATA.offerings,
        intelligence: data.intelligence && data.intelligence.length > 0 ? data.intelligence : FALLBACK_DATA.intelligence,
        isLoading: false,
        hasLoaded: true,
        error: null
      });
    } catch (err: any) {
      console.error('Error refetching CMS batch content, applying fallback:', err);
      set({
        hero: FALLBACK_DATA.hero,
        steps: FALLBACK_DATA.steps,
        founder: FALLBACK_DATA.founder,
        quotes: FALLBACK_DATA.quotes,
        testimonials: FALLBACK_DATA.testimonials,
        offerings: FALLBACK_DATA.offerings,
        intelligence: FALLBACK_DATA.intelligence,
        isLoading: false,
        hasLoaded: true,
        error: err.message || 'Failed to fetch sanctuary content.'
      });
    }
  }
}));
