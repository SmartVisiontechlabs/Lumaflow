-- Migration: Sprint 4 Waitlist & Package Enhancements
-- Run this in your Supabase SQL Editor.

-- 1. Create waitlist_entries table
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TEXT NOT NULL,
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Allow public waitlist inserts" ON public.waitlist_entries;
CREATE POLICY "Allow public waitlist inserts" ON public.waitlist_entries
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own waitlist entries" ON public.waitlist_entries;
CREATE POLICY "Users can read own waitlist entries" ON public.waitlist_entries
    FOR SELECT USING (LOWER(email) = LOWER(auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Admin full access on waitlist entries" ON public.waitlist_entries;
CREATE POLICY "Admin full access on waitlist entries" ON public.waitlist_entries
    FOR ALL USING (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    );

-- 2. Add columns to packages table to conform to required fields
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS credits INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS valid_days INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS active BOOLEAN;

-- Sync legacy total_credits/is_active columns with new credits/active/valid_days columns
CREATE OR REPLACE FUNCTION public.sync_package_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserting or updating
  -- Sync credits and total_credits
  IF NEW.total_credits IS NOT NULL AND (NEW.credits IS NULL OR NEW.total_credits IS DISTINCT FROM OLD.total_credits) THEN
    NEW.credits := NEW.total_credits;
  ELSIF NEW.credits IS NOT NULL THEN
    NEW.total_credits := NEW.credits;
  END IF;

  -- Sync active and is_active
  IF NEW.is_active IS NOT NULL AND (NEW.active IS NULL OR NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
    NEW.active := NEW.is_active;
  ELSIF NEW.active IS NOT NULL THEN
    NEW.is_active := NEW.active;
  END IF;

  -- Sync valid_days and validity_months
  IF NEW.validity_months IS NOT NULL AND (NEW.valid_days IS NULL OR NEW.validity_months IS DISTINCT FROM OLD.validity_months) THEN
    NEW.valid_days := NEW.validity_months * 30;
  ELSIF NEW.valid_days IS NOT NULL THEN
    NEW.validity_months := CEIL(NEW.valid_days::float / 30.0);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_package_columns_trigger ON public.packages;
CREATE TRIGGER sync_package_columns_trigger
  BEFORE INSERT OR UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.sync_package_columns();

-- Perform initial sync for existing packages
UPDATE public.packages 
SET credits = total_credits,
    active = is_active,
    valid_days = COALESCE(validity_months, 1) * 30
WHERE credits IS NULL OR active IS NULL OR valid_days IS NULL;

-- 3. Seed/Insert the Sprint 4 Wellness Packages
INSERT INTO public.packages (name, slug, description, price, total_credits, credits, validity_months, valid_days, is_active, active, is_featured) VALUES
('Foundation Journey', 'foundation-journey', 'A 3-session breathwork path to establish somatic awareness and regulate your nervous system.', 120, 3, 3, 1, 30, TRUE, TRUE, FALSE),
('Transformation Journey', 'transformation-journey', 'A 6-session somatic exploration to release deep tension, trauma, and integrate new patterns.', 220, 6, 6, 2, 60, TRUE, TRUE, TRUE),
('Deep Integration Journey', 'deep-integration-journey', 'A comprehensive 12-session cellular integration path for sustained awakening and somatic mastery.', 420, 12, 12, 4, 90, TRUE, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  total_credits = EXCLUDED.total_credits,
  credits = EXCLUDED.credits,
  validity_months = EXCLUDED.validity_months,
  valid_days = EXCLUDED.valid_days,
  is_active = EXCLUDED.is_active,
  active = EXCLUDED.active,
  is_featured = EXCLUDED.is_featured;
