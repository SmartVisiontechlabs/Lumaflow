-- Migration: Add Zoom Integration fields and Reminder Tracking to Bookings table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS zoom_meeting_id text,
ADD COLUMN IF NOT EXISTS zoom_join_url text,
ADD COLUMN IF NOT EXISTS zoom_start_url text,
ADD COLUMN IF NOT EXISTS meeting_password text,
ADD COLUMN IF NOT EXISTS meeting_type text,
ADD COLUMN IF NOT EXISTS calendar_status text,
ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
