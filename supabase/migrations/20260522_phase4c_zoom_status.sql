-- Migration: Add zoom_status column to bookings table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS zoom_status text;
