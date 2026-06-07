-- Migration: Auth and Booking Security Stabilization
-- Run this in your Supabase SQL Editor.

-- ==========================================
-- 1. BOOKINGS TABLE SECURITY & CONSTRAINT
-- ==========================================

-- Enable Row Level Security (RLS) on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Add payment_processed column if not exists
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_processed BOOLEAN NOT NULL DEFAULT FALSE;

-- Add partial unique index on stripe_payment_id to prevent duplicate checkout session confirmations
DROP INDEX IF EXISTS public.bookings_stripe_payment_id_unique_idx;
CREATE UNIQUE INDEX bookings_stripe_payment_id_unique_idx 
ON public.bookings (stripe_payment_id) 
WHERE (stripe_payment_id IS NOT NULL AND stripe_payment_id <> 'credit_booking');

-- RLS Policies for bookings
DROP POLICY IF EXISTS "Allow public booking inserts" ON public.bookings;
CREATE POLICY "Allow public booking inserts" ON public.bookings
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;
CREATE POLICY "Users can read own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id OR LOWER(email) = LOWER(auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id OR LOWER(email) = LOWER(auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Admin full access on bookings" ON public.bookings;
CREATE POLICY "Admin full access on bookings" ON public.bookings
    FOR ALL USING (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    );


-- ==========================================
-- 2. USER_PROFILES TABLE SECURITY
-- ==========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own user_profile" ON public.user_profiles;
CREATE POLICY "Users can read own user_profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own user_profile" ON public.user_profiles;
CREATE POLICY "Users can update own user_profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin full access on user_profiles" ON public.user_profiles;
CREATE POLICY "Admin full access on user_profiles" ON public.user_profiles
    FOR ALL USING (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    );


-- ==========================================
-- 3. MEMBERSHIP_CREDITS TABLE SECURITY
-- ==========================================

ALTER TABLE public.membership_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own membership_credits" ON public.membership_credits;
CREATE POLICY "Users can read own membership_credits" ON public.membership_credits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access on membership_credits" ON public.membership_credits;
CREATE POLICY "Admin full access on membership_credits" ON public.membership_credits
    FOR ALL USING (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    );


-- ==========================================
-- 4. USER_PACKAGES TABLE SECURITY
-- ==========================================

ALTER TABLE public.user_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own user_packages" ON public.user_packages;
CREATE POLICY "Users can read own user_packages" ON public.user_packages
    FOR SELECT USING (LOWER(user_email) = LOWER(auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Admin full access on user_packages" ON public.user_packages;
CREATE POLICY "Admin full access on user_packages" ON public.user_packages
    FOR ALL USING (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    );
