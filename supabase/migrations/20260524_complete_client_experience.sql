-- Migration: Complete Client Experience Phase 5B
-- Create user_profiles, membership_credits, booking_history and RPC helper functions.
-- Run this in your Supabase SQL Editor.

-- 1. Create user_profiles table (synchronized with auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper to check if a user is an admin without causing infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can read own user_profile" ON public.user_profiles;
CREATE POLICY "Users can read own user_profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own user_profile" ON public.user_profiles;
CREATE POLICY "Users can update own user_profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin full access on user_profiles" ON public.user_profiles;
CREATE POLICY "Admin full access on user_profiles" ON public.user_profiles
    FOR ALL USING (public.is_admin());

-- 2. Create membership_credits table
CREATE TABLE IF NOT EXISTS public.membership_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    email TEXT NOT NULL,
    total_credits INTEGER NOT NULL DEFAULT 0,
    used_credits INTEGER NOT NULL DEFAULT 0,
    remaining_credits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.membership_credits ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for membership_credits
DROP POLICY IF EXISTS "Users can read own membership_credits" ON public.membership_credits;
CREATE POLICY "Users can read own membership_credits" ON public.membership_credits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access on membership_credits" ON public.membership_credits;
CREATE POLICY "Admin full access on membership_credits" ON public.membership_credits
    FOR ALL USING (public.is_admin());

-- 3. Create booking_history table
CREATE TABLE IF NOT EXISTS public.booking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    ritual_name TEXT,
    session_date_time TIMESTAMPTZ,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.booking_history ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for booking_history
DROP POLICY IF EXISTS "Users can read own booking_history" ON public.booking_history;
CREATE POLICY "Users can read own booking_history" ON public.booking_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access on booking_history" ON public.booking_history;
CREATE POLICY "Admin full access on booking_history" ON public.booking_history
    FOR ALL USING (public.is_admin());

-- 4. Alter bookings table to link user_id
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- 5. Trigger to auto-create user_profiles record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'client'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-establish the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure any existing users in auth.users have a user_profile
INSERT INTO public.user_profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', ''), 'client'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 6. SECURITY DEFINER RPC Functions for Backend
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_to_check text)
RETURNS uuid AS $$
DECLARE
  found_id uuid;
BEGIN
  SELECT id INTO found_id FROM public.user_profiles WHERE LOWER(email) = LOWER(email_to_check) LIMIT 1;
  RETURN found_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_or_update_membership_credits(
  p_user_id uuid,
  p_email text,
  p_total_credits int,
  p_remaining_credits int
) RETURNS void AS $$
BEGIN
  INSERT INTO public.membership_credits (user_id, email, total_credits, remaining_credits, used_credits, updated_at)
  VALUES (p_user_id, p_email, p_total_credits, p_remaining_credits, 0, now())
  ON CONFLICT (user_id) DO UPDATE
  SET total_credits = public.membership_credits.total_credits + p_total_credits,
      remaining_credits = public.membership_credits.remaining_credits + p_remaining_credits,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION deduct_membership_credit(p_user_id uuid, p_count int)
RETURNS boolean AS $$
DECLARE
  current_remaining int;
BEGIN
  SELECT remaining_credits INTO current_remaining FROM public.membership_credits WHERE user_id = p_user_id FOR UPDATE;
  IF current_remaining IS NULL OR current_remaining < p_count THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.membership_credits
  SET remaining_credits = remaining_credits - p_count,
      used_credits = used_credits + p_count,
      updated_at = now()
  WHERE user_id = p_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_booking_history(
  p_user_id uuid,
  p_booking_id uuid,
  p_ritual_name text,
  p_session_date_time timestamptz,
  p_status text
) RETURNS void AS $$
BEGIN
  INSERT INTO public.booking_history (user_id, booking_id, ritual_name, session_date_time, status, created_at)
  VALUES (p_user_id, p_booking_id, p_ritual_name, p_session_date_time, p_status, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

