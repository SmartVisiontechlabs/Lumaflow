export interface HeroContent {
  id: string;
  headline: string;
  subheadline: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  background_visual_url: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  display_order: number;
  is_visible: boolean;
  metadata: Record<string, any>;
  updated_at: string;
}

export interface TransformationStep {
  id: string;
  step_number: number;
  title: string;
  subtitle: string;
  description: string;
  icon_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutAlanna {
  id: string;
  photo_url: string | null;
  bio_title: string;
  quote: string | null;
  bio_body: string;
  credentials: string[];
  cta_label: string;
  cta_link: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  quote_text: string;
  author_text: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface HealingPath {
  id: string;
  title: string;
  slug: string;
  benefit: string;
  duration_minutes: number;
  price: number;
  cta_text: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface RecommendationMatrixEntry {
  id?: string;
  journey_type: string;
  feeling: string;
  recommended_ritual: string;
  focus: string;
  duration_minutes: number;
  explanation: string;
  quote: string;
  confidence: string;
  confidence_reason: string;
  alt_durations: number[];
  archetype: string;
  is_active?: boolean;
  created_at?: string;
}

export interface AvailabilitySetting {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  format_allowed: 'both' | 'virtual' | 'studio';
  is_active: boolean;
  updated_at: string;
}

export interface PaymentLog {
  id: string;
  booking_id: string | null;
  stripe_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

