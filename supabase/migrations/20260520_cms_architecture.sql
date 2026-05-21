-- 1. Profiles & Role Management
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hero Content CMS
CREATE TABLE IF NOT EXISTS public.hero_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    headline TEXT NOT NULL,
    subheadline TEXT NOT NULL,
    cta_text TEXT NOT NULL DEFAULT 'Begin Your Healing Journey',
    cta_link TEXT NOT NULL DEFAULT '/book',
    secondary_cta_text TEXT NOT NULL DEFAULT 'Explore Healing Paths',
    secondary_cta_link TEXT NOT NULL DEFAULT '#transformation-journey',
    background_visual_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Homepage Sections Config
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL UNIQUE,
    title TEXT,
    subtitle TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transformation Steps CMS
CREATE TABLE IF NOT EXISTS public.transformation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Sparkles',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. About Alanna Bio CMS
CREATE TABLE IF NOT EXISTS public.about_alanna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_url TEXT,
    bio_title TEXT DEFAULT 'Meet Alanna',
    quote TEXT,
    bio_body TEXT NOT NULL,
    credentials TEXT[] DEFAULT '{}'::text[],
    cta_label TEXT DEFAULT 'Begin Your Journey',
    cta_link TEXT DEFAULT '/book',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Wisdom Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_text TEXT NOT NULL,
    author_text TEXT DEFAULT 'Client Reflection',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Healing Paths / Programs
CREATE TABLE IF NOT EXISTS public.healing_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    benefit TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price NUMERIC NOT NULL DEFAULT 0,
    cta_text TEXT DEFAULT 'Begin Journey',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Recommendation Intelligence Matrix
CREATE TABLE IF NOT EXISTS public.recommendation_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_type TEXT NOT NULL, -- e.g., 'Breathwork', 'Somatic Flow', 'Deep Meditation'
    feeling TEXT NOT NULL,      -- e.g., 'overwhelmed', 'disconnected', 'seeking clarity'
    recommended_ritual TEXT NOT NULL,
    focus TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    explanation TEXT NOT NULL,
    quote TEXT NOT NULL,
    confidence TEXT NOT NULL DEFAULT 'Highly Aligned',
    confidence_reason TEXT NOT NULL,
    alt_durations INTEGER[] DEFAULT '{}'::integer[],
    archetype TEXT NOT NULL DEFAULT 'integration',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Availability Settings (Weekly Schedule)
CREATE TABLE IF NOT EXISTS public.availability_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    format_allowed TEXT NOT NULL DEFAULT 'both' CHECK (format_allowed IN ('both', 'virtual', 'studio')),
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Payments Log Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    stripe_payment_id TEXT UNIQUE NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL, -- e.g., 'succeeded', 'failed', 'refunded'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and configure policies for each table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_alanna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healing_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Read policies: public-facing tables are publicly readable
DROP POLICY IF EXISTS "Public Read Hero Content" ON public.hero_content;
CREATE POLICY "Public Read Hero Content" ON public.hero_content FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Homepage Sections" ON public.homepage_sections;
CREATE POLICY "Public Read Homepage Sections" ON public.homepage_sections FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Public Read Transformation Steps" ON public.transformation_steps;
CREATE POLICY "Public Read Transformation Steps" ON public.transformation_steps FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read About Alanna" ON public.about_alanna;
CREATE POLICY "Public Read About Alanna" ON public.about_alanna FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Quotes" ON public.quotes;
CREATE POLICY "Public Read Quotes" ON public.quotes FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Testimonials" ON public.testimonials;
CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Healing Paths" ON public.healing_paths;
CREATE POLICY "Public Read Healing Paths" ON public.healing_paths FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Recommendation Matrix" ON public.recommendation_matrix;
CREATE POLICY "Public Read Recommendation Matrix" ON public.recommendation_matrix FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Availability Settings" ON public.availability_settings;
CREATE POLICY "Public Read Availability Settings" ON public.availability_settings FOR SELECT USING (is_active = true);

-- Write policies: write actions are allowed only for admin profiles
DROP POLICY IF EXISTS "Admin All Profiles" ON public.profiles;
CREATE POLICY "Admin All Profiles" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write Hero" ON public.hero_content;
CREATE POLICY "Admin Write Hero" ON public.hero_content FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write Sections" ON public.homepage_sections;
CREATE POLICY "Admin Write Sections" ON public.homepage_sections FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write Transformation" ON public.transformation_steps;
CREATE POLICY "Admin Write Transformation" ON public.transformation_steps FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write About Alanna" ON public.about_alanna;
CREATE POLICY "Admin Write About Alanna" ON public.about_alanna FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write Quotes" ON public.quotes;
CREATE POLICY "Admin Write Quotes" ON public.quotes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write Testimonials" ON public.testimonials;
CREATE POLICY "Admin Write Testimonials" ON public.testimonials FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write Healing Paths" ON public.healing_paths;
CREATE POLICY "Admin Write Healing Paths" ON public.healing_paths FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write Recommendation" ON public.recommendation_matrix;
CREATE POLICY "Admin Write Recommendation" ON public.recommendation_matrix FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write Availability Settings" ON public.availability_settings;
CREATE POLICY "Admin Write Availability Settings" ON public.availability_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Write Payments" ON public.payments;
CREATE POLICY "Admin Write Payments" ON public.payments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed Initial Core Data
INSERT INTO public.hero_content (headline, subheadline, cta_text, cta_link, secondary_cta_text, secondary_cta_link, background_visual_url, is_active)
VALUES (
    'Illuminate your \nhealing journey\nwith LumaFlow.',
    'Step into a luminous sanctuary of high-frequency somatic restoration, where ancient stillness meets the cutting edge of personal transformation. Here, we don''t fix you—we help you remember who you are.',
    'Begin Your Healing Journey',
    '/book',
    'Explore Healing Paths',
    '#transformation-journey',
    NULL,
    TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO public.homepage_sections (section_key, title, subtitle, display_order, is_visible) VALUES
('hero', 'Hero Section', 'A Sacred Space for Awakening', 1, TRUE),
('transformation', 'Path to Transformation', 'The Journey', 2, TRUE),
('about', 'Meet Alanna', 'THE HEART BEHIND LUMAFLOW', 3, TRUE),
('quote', 'Client Reflection', 'Wisdom', 4, TRUE),
('testimonials', 'Stories of Transformation', 'Testimonials', 5, TRUE),
('programs', 'Journeys to inner calm', 'Our Offerings', 6, TRUE)
ON CONFLICT (section_key) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle;

INSERT INTO public.transformation_steps (step_number, title, subtitle, description, icon_name, is_active) VALUES
(1, 'Release', 'Surrender & Empty', 'Let go of stored tension and shed the weight of expectations. Create a quiet, empty space within your body and mind.', 'Wind', TRUE),
(2, 'Reconnect', 'Listen & Witness', 'Tune into the subtle rhythm of your breathing. Gently bring your awareness back to the organic wisdom of the present moment.', 'Heart', TRUE),
(3, 'Restore', 'Nourish & Soften', 'Nourish your nervous system and re-align your natural frequencies. Sink into a state of deep, restorative rest.', 'Sparkles', TRUE),
(4, 'Illuminate', 'Radiate & Expand', 'Step into your natural brightness and glow. Radiate peace, vitality, and heart-centered, creative clarity.', 'Sun', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.about_alanna (photo_url, bio_title, quote, bio_body, credentials, cta_label, cta_link) VALUES
(
    '/alanna-new.jpeg',
    'Meet Alanna',
    'I created Lumaflow as a space where you don’t have to fix yourself — only remember who you are.',
    'Alanna is a somatic practitioner and guide devoted to helping you reconnect with your natural state of calm through breath, movement, and awareness.',
    ARRAY['Certified Somatic & Breathwork Facilitator', '1,200+ Hours of Held Container Space'],
    'Begin Your Journey',
    '/book'
) ON CONFLICT DO NOTHING;

INSERT INTO public.quotes (quote_text, author_text, is_active, display_order) VALUES
('Transforming negative energy into love and light.', 'Client Reflection', TRUE, 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.testimonials (name, role, quote, rating, is_featured, is_active, display_order) VALUES
('Elena S.', 'Somatic Breathwork Client', 'Lumaflow changed my relationship with my own body. I finally feel at home in my own skin. The breathwork sessions are a sacred hour of pure, unfiltered return.', 5, FALSE, TRUE, 1),
('Julian M.', 'Private Practice Integration', 'Walking into these sessions feels like leaving the weight of the world at the door. Alanna creates a container of unmatched safety, light, and grace.', 5, TRUE, TRUE, 2),
('Sophia R.', 'Deep Meditation Immersion', 'A profound shift in my nervous system. After months of chronic stress, Lumaflow helped me locate a well of deep stillness I didn''t know I still possessed.', 5, FALSE, TRUE, 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.healing_paths (title, slug, benefit, duration_minutes, price, cta_text, display_order, is_active) VALUES
('Breathwork', 'breathwork', 'Release held tension and emotional heaviness.', 60, 150, 'Begin Journey', 1, TRUE),
('Somatic Flow', 'somatic-flow', 'Reconnect body awareness and nervous system ease.', 90, 180, 'Begin Journey', 2, TRUE),
('Deep Meditation', 'deep-meditation', 'Anchor into profound stillness and inner quiet.', 60, 120, 'Begin Journey', 3, TRUE)
ON CONFLICT DO NOTHING;

-- Seed Recommendation Matrix (all 18 combinations)
INSERT INTO public.recommendation_matrix (journey_type, feeling, recommended_ritual, focus, duration_minutes, explanation, quote, confidence, confidence_reason, alt_durations, archetype, is_active) VALUES
-- Breathwork
('Breathwork', 'heavy', 'Deep Release Ritual', 'Cathartic Breath & Cellular Release', 90, 'Heaviness often reflects stagnant emotional energy held in the body''s fascia. Active pranayama and vibrational breath cycles create the internal pressure needed to move what has been stuck — flushing the emotional system and restoring natural flow.', 'Letting go is not an action. It is a surrender.', 'Highly Aligned', 'Breathwork is the primary clinical modality for processing and releasing heavy, stagnant emotional charge.', ARRAY[60, 120], 'breathwork', TRUE),
('Breathwork', 'emotionally drained', 'Deep Release Ritual', 'Cellular Renewal & Energetic Restoration', 90, 'When emotionally drained, the breath has often become shallow and restricted. Slow circular breathing rebuilds the oxygen-rich environment that allows emotional energy to replenish from the inside out.', 'What is empty can also be made whole.', 'Highly Aligned', 'Breathwork directly addresses the depleted energetic state that underlies emotional fatigue.', ARRAY[60, 120], 'breathwork', TRUE),
('Breathwork', 'stressed', 'Nervous System Reset', 'Vagal Tone & Parasympathetic Coherence', 60, 'Stress is often held as chronic activation in the nervous system. Structured breath retention techniques — 4-7-8 patterns and box breathing — guide your brainwaves from beta into deep, recovery-rich alpha states.', 'Breathe in space. Breathe out quiet.', 'Highly Aligned', 'Controlled breathwork is the fastest evidence-based pathway to deactivating the stress response.', ARRAY[45, 90], 'breathwork', TRUE),
('Breathwork', 'anxious', 'Nervous System Reset', 'Coherence Breathing & Panic Release', 60, 'Anxiety is energy moving faster than the body can process. Slow, rhythmic breathwork — particularly coherence breathing at 5.5 breaths per minute — directly calms the amygdala and restores a sense of safe embodiment.', 'In the eye of the storm, there is a place of absolute quiet.', 'Highly Aligned', 'Breathwork creates immediate physiological changes that interrupt the anxiety feedback loop.', ARRAY[45, 90], 'breathwork', TRUE),
('Breathwork', 'disconnected', 'Emotional Detox', 'Somatic Reconnection through Breath', 90, 'Disconnection often signals a protective withdrawal of awareness from the body. Circular breathing patterns dissolve the habitual mind-body split, using the breath as a bridge back to felt sensation and inner knowing.', 'The answer is not in the noise. It is in the depth of your breath.', 'Strong Match', 'Breathwork is highly effective at dissolving dissociation and rebuilding somatic awareness.', ARRAY[60, 120], 'breathwork', TRUE),
('Breathwork', 'seeking clarity', 'Emotional Detox', 'Mental Fog Clearing & Intuition Opening', 90, 'Clarity is obscured by the accumulation of unprocessed thought and emotion. Conscious circular breathing creates a gentle inner purge — clearing the field of mental static to reveal the clear signal beneath.', 'The answer was always there. We simply clear the static.', 'Strong Match', 'Breathwork creates altered states that reliably access intuition beyond analytical mind.', ARRAY[60, 120], 'breathwork', TRUE),

-- Somatic Flow
('Somatic Flow', 'heavy', 'Vitality Restoration', 'Energy Body Rejuvenation & Fascia Flow', 120, 'Heaviness accumulates in the connective tissue — the fascia — as a form of chronic muscle bracing. Slow, passive somatic release postures held over time create the deep myofascial unwinding needed to restore genuine lightness.', 'Rest is the soil from which vitality grows.', 'Highly Aligned', 'Somatic bodywork directly addresses the physical substrate of emotional heaviness in the fascia.', ARRAY[60, 90], 'somatic', TRUE),
('Somatic Flow', 'emotionally drained', 'Vitality Restoration', 'Deep Replenishment & Energy Body Reset', 120, 'Burnout requires more than rest — it requires intelligent replenishment. Restorative somatic postures combined with conscious body mapping allow the nervous system to shift from survival mode into genuine recovery.', 'You cannot pour from an empty vessel. Let us refill yours.', 'Highly Aligned', 'Long-form restorative somatic work is the gold standard for nervous system recovery from burnout.', ARRAY[60, 90], 'somatic', TRUE),
('Somatic Flow', 'stressed', 'Embodiment Journey', 'Myofascial Release & Rhythmic Flow', 60, 'Stress creates chronic holding patterns in the body — tight shoulders, a braced jaw, a contracted belly. Slow rhythmic somatic movement and myofascial release dissolve these physical stress signatures, signaling safety to the nervous system.', 'Your body is the temple. Movement is the prayer.', 'Highly Aligned', 'Somatic movement is clinically validated for releasing the physical holding patterns of chronic stress.', ARRAY[45, 90], 'somatic', TRUE),
('Somatic Flow', 'anxious', 'Embodiment Journey', 'Grounding Sequence & Sensory Anchoring', 60, 'Anxiety pulls awareness into the future. Slow, tactile somatic exercises — orienting to physical sensation, weight and texture — anchor awareness back into the present moment of the body, interrupting the anxiety loop.', 'Feel the ground beneath you. It has always held you.', 'Strong Match', 'Somatic grounding is the most direct pathway to interrupting anxiety''s future-orientation.', ARRAY[45, 90], 'somatic', TRUE),
('Somatic Flow', 'disconnected', 'Sacred Body Flow', 'Proprioceptive Grounding & Integration', 90, 'Disconnection is a withdrawal of consciousness from the body''s territory. Through tactile self-contact, spatial awareness exercises, and mindful movement, this session rebuilds the felt sense of being at home in physical form.', 'To inhabit the body is to walk on holy ground.', 'Highly Aligned', 'Somatic practice is the most direct modality for rebuilding body-mind connection and felt presence.', ARRAY[60, 120], 'somatic', TRUE),
('Somatic Flow', 'seeking clarity', 'Sacred Body Flow', 'Body Wisdom & Intuitive Movement', 90, 'Clarity is often a body signal waiting to be heard. When the mind is searching, the body already knows. Intuitive somatic movement creates the conditions for embodied wisdom to surface naturally.', 'The body knows what the mind is still trying to learn.', 'Strong Match', 'Somatic practices access pre-cognitive body wisdom that transcends mental analysis.', ARRAY[60, 120], 'somatic', TRUE),

-- Meditation
('Deep Meditation', 'heavy', 'Expansion Meditation', 'Transcendental Awareness & Spaciousness', 90, 'Heavy states contract the sense of self into a small, dense point. Guided expansion meditation — using cosmic imagery and awareness-widening techniques — restores the experience of spaciousness that naturally dissolves the weight of density.', 'You are not a drop in the ocean. You are the entire ocean in a drop.', 'Strong Match', 'Expansion meditation creates psychological distance from heavy emotional content, providing immediate relief.', ARRAY[60, 120], 'meditation', TRUE),
('Deep Meditation', 'emotionally drained', 'Expansion Meditation', 'Spiritual Restoration & Light Infusion', 90, 'When emotionally depleted, the spiritual dimension is often the fastest pathway to restoration. Guided astral expansion and cosmic awareness practices replenish at the source level — the consciousness itself — rather than just the symptomatic body.', 'Rest in the infinite. You are always held.', 'Strong Match', 'Transcendental meditation states are highly restorative for deep emotional exhaustion.', ARRAY[60, 120], 'meditation', TRUE),
('Deep Meditation', 'stressed', 'Stillness Ritual', 'Focus Anchoring & Thought Uncoupling', 45, 'Stress fills the mind with urgent, looping thoughts. Mindfulness anchors — returning attention to a single point of focus — interrupt the thought cascade. Sound vibration further slows brainwave activity into calm, coherent states.', 'Quiet the mind, and the soul will speak.', 'Highly Aligned', 'Meditation is the gold-standard intervention for cognitive stress — it directly targets the thought patterns driving it.', ARRAY[60, 90], 'meditation', TRUE),
('Deep Meditation', 'anxious', 'Stillness Ritual', 'Present-Moment Anchoring & Worry Release', 45, 'Anxiety lives in the future — in projected scenarios of what might happen. Mindfulness meditation, specifically noting practice, gently returns awareness to the safety of the present moment, dissolving the fuel that anxiety runs on.', 'In this moment, right now, you are safe.', 'Highly Aligned', 'Mindfulness meditation has the strongest evidence base of any intervention for anxiety.', ARRAY[60, 90], 'meditation', TRUE),
('Deep Meditation', 'disconnected', 'Deep Stillness', 'Pure Consciousness & Presence Return', 60, 'Disconnection dissolves when awareness rests in its own nature. Void meditation — observing the observer — returns consciousness to the fundamental sense of being that underlies all states and conditions.', 'Silence is the language of clarity.', 'Strong Match', 'Non-dual meditation practices are uniquely suited to healing the sense of disconnection from self.', ARRAY[45, 90], 'meditation', TRUE),
('Deep Meditation', 'seeking clarity', 'Deep Stillness', 'Intuitive Wisdom & Inner Guidance', 60, 'Clarity is not found by thinking harder — it emerges when mental activity quiets. Deep stillness meditation creates the inner silence in which genuine insight and intuitive direction can naturally arise.', 'Silence is the language of the soul. Everything else is a translation.', 'Highly Aligned', 'Meditation is the primary tool for accessing the clarity that lies beneath mental noise.', ARRAY[45, 90], 'meditation', TRUE)
ON CONFLICT DO NOTHING;

-- Seed Availability Settings (Monday - Friday 8am - 4pm, Saturday 10am - 2pm)
INSERT INTO public.availability_settings (day_of_week, start_time, end_time, format_allowed, is_active) VALUES
(1, '08:00:00', '16:00:00', 'both', TRUE),
(2, '08:00:00', '16:00:00', 'both', TRUE),
(3, '08:00:00', '16:00:00', 'both', TRUE),
(4, '08:00:00', '16:00:00', 'both', TRUE),
(5, '08:00:00', '16:00:00', 'both', TRUE),
(6, '10:00:00', '14:00:00', 'both', TRUE)
ON CONFLICT DO NOTHING;
