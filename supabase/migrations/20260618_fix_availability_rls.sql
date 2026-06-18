-- Migration: Fix Availability and Blocked Slots RLS Policies for Public Select
-- Run this in your Supabase SQL Editor.

-- 1. Ensure RLS is enabled on availability_settings
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing SELECT policy if exists and create a public read policy
DROP POLICY IF EXISTS "Public Read Availability Settings" ON public.availability_settings;
CREATE POLICY "Public Read Availability Settings" ON public.availability_settings 
    FOR SELECT USING (true);

-- 3. Ensure RLS is enabled on blocked_slots
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing SELECT policy if exists and create a public read policy
DROP POLICY IF EXISTS "Public Read Blocked Slots" ON public.blocked_slots;
CREATE POLICY "Public Read Blocked Slots" ON public.blocked_slots 
    FOR SELECT USING (true);
