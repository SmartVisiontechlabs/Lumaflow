export interface HeroContent {
  id: string;
  title?: string;
  subtitle?: string;
  primary_cta_label?: string;
  primary_cta_link?: string;
  secondary_cta_label?: string;
  secondary_cta_link?: string;
  updated_at?: string;

  // Mapped client properties
  headline?: string;
  subheadline?: string;
  cta_text?: string;
  cta_link?: string;
  secondary_cta_text?: string;
  background_visual_url?: string;
  is_active?: boolean;
}

export interface TransformationStep {
  id: string;
  step_number?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;

  // Mapped client properties
  icon_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FounderBio {
  id: string;
  name?: string;
  title?: string;
  bio?: string;
  quote?: string | null;
  image_url?: string | null;
  button_label?: string;
  button_link?: string;

  // Mapped client properties
  photo_url?: string;
  bio_title?: string;
  bio_body?: string;
  credentials?: string[];
  cta_label?: string;
  cta_link?: string;
  updated_at?: string;
}

export interface Quote {
  id: string;
  quote?: string;
  author?: string;
  sort_order?: number;
  is_featured?: boolean;

  // Mapped client properties
  quote_text?: string;
  author_text?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
}

export interface Review {
  id: string;
  client_name?: string;
  review_text?: string;
  program?: string;
  is_featured?: boolean;
  sort_order?: number;
  rating?: number;

  // Mapped client properties
  name?: string;
  role?: string;
  quote?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
}

export interface Offering {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  price?: number;
  image_url?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;

  // Mapped client properties
  slug?: string;
  benefit?: string;
  duration_minutes?: number;
  cta_text?: string;
  display_order?: number;
  created_at?: string;
}

export interface IntelligenceMatrixEntry {
  id: string;
  journey?: string;
  feeling?: string;
  recommended_ritual?: string;
  duration?: number;
  recommended_plan?: string;
  focus?: string;
  confidence_score?: string;
  is_active?: boolean;

  // Mapped client properties
  journey_type?: string;
  duration_minutes?: number;
  explanation?: string;
  quote?: string;
  confidence?: string;
  confidence_reason?: string;
  alt_durations?: number[];
  archetype?: string;
}

// Re-export old names as deprecated aliases to prevent immediate build breakages during migration
export type AboutAlanna = FounderBio;
export type Testimonial = Review;
export type HealingPath = Offering;
export type RecommendationMatrixEntry = IntelligenceMatrixEntry;
