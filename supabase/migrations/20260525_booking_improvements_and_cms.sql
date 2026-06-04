-- 1. Add payment_processed column to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_processed BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Create pages_content table for custom page CMS configurations
CREATE TABLE IF NOT EXISTS public.pages_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_name TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Enable Row Level Security (RLS) on pages_content
ALTER TABLE public.pages_content ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to prevent conflicts during re-runs
DROP POLICY IF EXISTS "Allow public read access to pages_content" ON public.pages_content;
DROP POLICY IF EXISTS "Allow authenticated admins to write pages_content" ON public.pages_content;

-- 5. Create select policy for public access
CREATE POLICY "Allow public read access to pages_content" ON public.pages_content
    FOR SELECT USING (true);

-- 6. Create write policy for administrators
CREATE POLICY "Allow authenticated admins to write pages_content" ON public.pages_content
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    );

-- 7. Insert default seed content for Classes and Contact pages
INSERT INTO public.pages_content (page_name, content)
VALUES 
(
  'classes',
  '{
    "hero_title": "Your Path to\\nInner Alignment",
    "hero_subtitle": "\\"Choose the practice that meets you where you are.\\"",
    "services": [
      {
        "title": "Breathwork",
        "icon": "Wind",
        "description": "Conscious breathing techniques to regulate your nervous system and release emotional blockages.",
        "image": "/classes-image.png",
        "benefits": ["Stress reduction", "Mental clarity", "Emotional release"]
      },
      {
        "title": "Somatic Movement",
        "icon": "Heart",
        "description": "Gently connect with your body\'s innate wisdom through mindful, grounded movement practices.",
        "image": "/about-image.png",
        "benefits": ["Body awareness", "Trauma release", "Physical grounding"]
      },
      {
        "title": "Meditation",
        "icon": "Sparkles",
        "description": "Guided sessions to anchor your mind in stillness and cultivate profound inner peace.",
        "image": "/ambient-image.png",
        "benefits": ["Deep presence", "Anxiety relief", "Spiritual connection"]
      }
    ],
    "cta_title": "Begin your\\njourney inward",
    "cta_description": "Spaces are intentionally limited to preserve the sacred nature of each container. Reserve your spot in our next group session.",
    "cta_button_text": "Book Your Session"
  }'::jsonb
),
(
  'contact',
  '{
    "hero_title": "Begin your conversation\\nwith stillness",
    "hero_subtitle": "We’re here to support you — gently, thoughtfully, at your pace.",
    "form_title": "Inquiry",
    "form_microcopy": "\\"Take a moment. Breathe. Then share what’s on your heart.\\"",
    "button_text": "Reach Out Gently",
    "trust_details": [
      "Typically responds within 24 hours",
      "100+ healing journeys supported",
      "Private & confidential"
    ],
    "right_quote": "\\"You don’t have to do this alone.\\"",
    "image_url": "/contact-image.jpg"
  }'::jsonb
)
ON CONFLICT (page_name) DO NOTHING;
