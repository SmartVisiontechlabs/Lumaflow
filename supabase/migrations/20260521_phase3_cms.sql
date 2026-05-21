-- Drop old CMS tables
DROP TABLE IF EXISTS public.hero_content CASCADE;
DROP TABLE IF EXISTS public.transformation_steps CASCADE;
DROP TABLE IF EXISTS public.about_alanna CASCADE;
DROP TABLE IF EXISTS public.founder_bio CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.healing_paths CASCADE;
DROP TABLE IF EXISTS public.offerings CASCADE;
DROP TABLE IF EXISTS public.recommendation_matrix CASCADE;
DROP TABLE IF EXISTS public.intelligence_matrix CASCADE;

-- 1. Hero Content Table
CREATE TABLE public.hero_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    primary_cta_label TEXT NOT NULL,
    primary_cta_link TEXT NOT NULL,
    secondary_cta_label TEXT NOT NULL,
    secondary_cta_link TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transformation Steps Table
CREATE TABLE public.transformation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Founder Bio Table
CREATE TABLE public.founder_bio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    credentials TEXT[] DEFAULT '{}'::text[],
    quote TEXT,
    image_url TEXT,
    button_label TEXT NOT NULL,
    button_link TEXT NOT NULL
);

-- 4. Quotes Table
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE
);

-- 5. Reviews Table (formerly testimonials)
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    review_text TEXT NOT NULL,
    program TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5)
);

-- 6. Offerings Table (formerly healing paths)
CREATE TABLE public.offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    price NUMERIC NOT NULL DEFAULT 0,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- 7. Intelligence Matrix Table (formerly recommendation matrix)
CREATE TABLE public.intelligence_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey TEXT NOT NULL,
    feeling TEXT NOT NULL,
    recommended_ritual TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    recommended_plan TEXT NOT NULL,
    focus TEXT NOT NULL,
    confidence_score TEXT NOT NULL DEFAULT 'Highly Aligned',
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_bio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_matrix ENABLE ROW LEVEL SECURITY;

-- Read policies: public-facing tables are publicly readable
CREATE POLICY "Public Read Hero Content" ON public.hero_content FOR SELECT USING (true);
CREATE POLICY "Public Read Transformation Steps" ON public.transformation_steps FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Founder Bio" ON public.founder_bio FOR SELECT USING (true);
CREATE POLICY "Public Read Quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Offerings" ON public.offerings FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Intelligence Matrix" ON public.intelligence_matrix FOR SELECT USING (is_active = true);

-- Write policies: write actions are allowed only for admin profiles
CREATE POLICY "Admin Write Hero" ON public.hero_content FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Write Transformation" ON public.transformation_steps FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Write Founder Bio" ON public.founder_bio FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Write Quotes" ON public.quotes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Write Reviews" ON public.reviews FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Write Offerings" ON public.offerings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Write Intelligence" ON public.intelligence_matrix FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed Initial Core Data
INSERT INTO public.hero_content (title, subtitle, primary_cta_label, primary_cta_link, secondary_cta_label, secondary_cta_link)
VALUES (
    'Illuminate your ' || CHR(10) || 'healing journey' || CHR(10) || 'with LumaFlow.',
    'Step into a luminous sanctuary of high-frequency somatic restoration, where ancient stillness meets the cutting edge of personal transformation. Here, we don''t fix you—we help you remember who you are.',
    'Begin Your Healing Journey',
    '/book',
    'Explore Healing Paths',
    '#transformation-journey'
);

INSERT INTO public.transformation_steps (step_number, title, subtitle, description, icon, sort_order, is_active) VALUES
(1, 'Release', 'Surrender & Empty', 'Let go of stored tension and shed the weight of expectations. Create a quiet, empty space within your body and mind.', 'Wind', 1, TRUE),
(2, 'Reconnect', 'Listen & Witness', 'Tune into the subtle rhythm of your breathing. Gently bring your awareness back to the organic wisdom of the present moment.', 'Heart', 2, TRUE),
(3, 'Restore', 'Nourish & Soften', 'Nourish your nervous system and re-align your natural frequencies. Sink into a state of deep, restorative rest.', 'Sparkles', 3, TRUE),
(4, 'Illuminate', 'Radiate & Expand', 'Step into your natural brightness and glow. Radiate peace, vitality, and heart-centered, creative clarity.', 'Sun', 4, TRUE);

INSERT INTO public.founder_bio (name, title, bio, credentials, quote, image_url, button_label, button_link) VALUES
(
    'Alanna',
    'Meet Alanna',
    'Alanna is a somatic practitioner and guide devoted to helping you reconnect with your natural state of calm through breath, movement, and awareness.',
    ARRAY['Certified Somatic Facilitator', 'Breathwork Practitioner (1,200+ Hours)'],
    'I created Lumaflow as a space where you don’t have to fix yourself — only remember who you are.',
    '/alanna-new.jpeg',
    'Begin Your Journey',
    '/book'
);

INSERT INTO public.quotes (quote, author, sort_order, is_featured) VALUES
('Transforming negative energy into love and light.', 'Client Reflection', 1, TRUE);

INSERT INTO public.reviews (client_name, review_text, program, is_featured, sort_order, rating) VALUES
('Elena S.', 'Lumaflow changed my relationship with my own body. I finally feel at home in my own skin. The breathwork sessions are a sacred hour of pure, unfiltered return.', 'Somatic Breathwork Client', FALSE, 1, 5),
('Julian M.', 'Walking into these sessions feels like leaving the weight of the world at the door. Alanna creates a container of unmatched safety, light, and grace.', 'Private Practice Integration', TRUE, 2, 5),
('Sophia R.', 'A profound shift in my nervous system. After months of chronic stress, Lumaflow helped me locate a well of deep stillness I didn''t know I still possessed.', 'Deep Meditation Immersion', FALSE, 3, 5);

INSERT INTO public.offerings (title, description, duration, price, image_url, is_featured, is_active, sort_order) VALUES
('Breathwork', 'Release held tension and emotional heaviness.', 60, 150, '/breathwork.jpg', FALSE, TRUE, 1),
('Somatic Flow', 'Reconnect body awareness and nervous system ease.', 90, 180, '/somatic.jpg', TRUE, TRUE, 2),
('Deep Meditation', 'Anchor into profound stillness and inner quiet.', 60, 120, '/meditation.jpg', FALSE, TRUE, 3);

-- Seed Intelligence Matrix (all 18 combinations)
INSERT INTO public.intelligence_matrix (journey, feeling, recommended_ritual, duration, recommended_plan, focus, confidence_score, is_active) VALUES
-- Breathwork
('Breathwork', 'heavy', 'Deep Release Ritual', 90, 'breathwork', 'Cathartic Breath & Cellular Release', 'Highly Aligned', TRUE),
('Breathwork', 'emotionally drained', 'Deep Release Ritual', 90, 'breathwork', 'Cellular Renewal & Energetic Restoration', 'Highly Aligned', TRUE),
('Breathwork', 'stressed', 'Nervous System Reset', 60, 'breathwork', 'Vagal Tone & Parasympathetic Coherence', 'Highly Aligned', TRUE),
('Breathwork', 'anxious', 'Nervous System Reset', 60, 'breathwork', 'Coherence Breathing & Panic Release', 'Highly Aligned', TRUE),
('Breathwork', 'disconnected', 'Emotional Detox', 90, 'breathwork', 'Somatic Reconnection through Breath', 'Strong Match', TRUE),
('Breathwork', 'seeking clarity', 'Emotional Detox', 90, 'breathwork', 'Mental Fog Clearing & Intuition Opening', 'Strong Match', TRUE),
-- Somatic Flow
('Somatic Flow', 'heavy', 'Vitality Restoration', 120, 'somatic', 'Energy Body Rejuvenation & Fascia Flow', 'Highly Aligned', TRUE),
('Somatic Flow', 'emotionally drained', 'Vitality Restoration', 120, 'somatic', 'Deep Replenishment & Energy Body Reset', 'Highly Aligned', TRUE),
('Somatic Flow', 'stressed', 'Embodiment Journey', 60, 'somatic', 'Myofascial Release & Rhythmic Flow', 'Highly Aligned', TRUE),
('Somatic Flow', 'anxious', 'Embodiment Journey', 60, 'somatic', 'Grounding Sequence & Sensory Anchoring', 'Strong Match', TRUE),
('Somatic Flow', 'disconnected', 'Sacred Body Flow', 90, 'somatic', 'Proprioceptive Grounding & Integration', 'Highly Aligned', TRUE),
('Somatic Flow', 'seeking clarity', 'Sacred Body Flow', 90, 'somatic', 'Body Wisdom & Intuitive Movement', 'Strong Match', TRUE),
-- Meditation
('Deep Meditation', 'heavy', 'Expansion Meditation', 90, 'meditation', 'Transcendental Awareness & Spaciousness', 'Strong Match', TRUE),
('Deep Meditation', 'emotionally drained', 'Expansion Meditation', 90, 'meditation', 'Spiritual Restoration & Light Infusion', 'Strong Match', TRUE),
('Deep Meditation', 'stressed', 'Stillness Ritual', 45, 'meditation', 'Focus Anchoring & Thought Uncoupling', 'Highly Aligned', TRUE),
('Deep Meditation', 'anxious', 'Stillness Ritual', 45, 'meditation', 'Present-Moment Anchoring & Worry Release', 'Highly Aligned', TRUE),
('Deep Meditation', 'disconnected', 'Deep Stillness', 60, 'meditation', 'Pure Consciousness & Presence Return', 'Strong Match', TRUE),
('Deep Meditation', 'seeking clarity', 'Deep Stillness', 60, 'meditation', 'Intuitive Wisdom & Inner Guidance', 'Highly Aligned', TRUE);
