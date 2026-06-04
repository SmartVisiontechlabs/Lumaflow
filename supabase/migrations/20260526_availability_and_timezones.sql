-- Create availability_settings table to manage weekly availability schedule
CREATE TABLE IF NOT EXISTS public.availability_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    buffer_minutes INTEGER NOT NULL DEFAULT 30, -- default 30 mins buffer
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_day UNIQUE (day_of_week)
);

-- Enable RLS
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;

-- Policies for public read and admin all
DROP POLICY IF EXISTS "Public Read Availability Settings" ON public.availability_settings;
CREATE POLICY "Public Read Availability Settings" ON public.availability_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Full Access Availability Settings" ON public.availability_settings;
CREATE POLICY "Admin Full Access Availability Settings" ON public.availability_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed initial weekly schedule matching practitioner availability requirements
INSERT INTO public.availability_settings (day_of_week, start_time, end_time, buffer_minutes, is_active) VALUES
(1, '09:00:00', '13:00:00', 30, TRUE), -- Monday 9:00 AM -> 1:00 PM (30m buffer)
(3, '11:00:00', '16:00:00', 30, TRUE), -- Wednesday 11:00 AM -> 4:00 PM (30m buffer)
(5, '08:00:00', '12:00:00', 30, TRUE)  -- Friday 8:00 AM -> 12:00 PM (30m buffer)
ON CONFLICT (day_of_week) DO UPDATE SET
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    buffer_minutes = EXCLUDED.buffer_minutes,
    is_active = EXCLUDED.is_active;

-- Add practitioner_time and client_local_time columns to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS practitioner_time TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_local_time TEXT;
