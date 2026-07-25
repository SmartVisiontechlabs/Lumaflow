-- Migration: Create google_integrations table and alter bookings for provider-agnostic meetings
-- Run this in your Supabase SQL Editor

-- 1. Create google_integrations table
CREATE TABLE IF NOT EXISTS public.google_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    google_email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expiry_date BIGINT NOT NULL, -- Unix timestamp in milliseconds
    scope TEXT,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_google_integration UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.google_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for admin full access
DROP POLICY IF EXISTS "Admin full access on google_integrations" ON public.google_integrations;
CREATE POLICY "Admin full access on google_integrations" ON public.google_integrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 2. Alter bookings table to support provider-agnostic meeting fields
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_provider TEXT DEFAULT 'GOOGLE_MEET';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_status TEXT;
