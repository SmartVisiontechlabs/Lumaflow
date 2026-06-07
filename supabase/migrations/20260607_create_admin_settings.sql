-- Create admin_settings table to manage general and communication configurations
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read and admin write
DROP POLICY IF EXISTS "Public Read Admin Settings" ON public.admin_settings;
CREATE POLICY "Public Read Admin Settings" ON public.admin_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Full Access Admin Settings" ON public.admin_settings;
CREATE POLICY "Admin Full Access Admin Settings" ON public.admin_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed initial communication settings
INSERT INTO public.admin_settings (key, value) VALUES
('communication_config', '{"bookingConfirmations": true, "reminder24h": true, "prep1h": true, "adminNotifications": true}')
ON CONFLICT (key) DO NOTHING;
