-- Migration: Add validity_months to packages table and set default values
-- Run this in your Supabase SQL Editor

ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS validity_months INTEGER DEFAULT 1;

-- Update existing packages with correct validity
UPDATE public.packages SET validity_months = 1 WHERE slug = 'single-session';
UPDATE public.packages SET validity_months = 1 WHERE slug = 'intro-offer';
UPDATE public.packages SET validity_months = 3 WHERE slug = '10-class-package';
