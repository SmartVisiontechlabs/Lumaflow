-- Migration: Phase A-2 Payment Reliability & Booking Engine Stabilization
-- Run this in your Supabase SQL Editor.

-- ==========================================
-- 1. ADD COLUMN & UNIQUE INDEX ON BOOKINGS
-- ==========================================

-- Add payment_processed column if it does not exist
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_processed BOOLEAN NOT NULL DEFAULT FALSE;

-- Add partial unique index on stripe_payment_id to prevent duplicate confirmations
DROP INDEX IF EXISTS public.bookings_stripe_payment_id_unique_idx;
CREATE UNIQUE INDEX bookings_stripe_payment_id_unique_idx 
ON public.bookings (stripe_payment_id) 
WHERE (stripe_payment_id IS NOT NULL AND stripe_payment_id <> 'credit_booking');

-- ==========================================
-- 2. CREATE TRANSACTIONAL BOOKING CONFIRM RPC
-- ==========================================

CREATE OR REPLACE FUNCTION public.confirm_booking_transactional(
  p_booking_id UUID,
  p_user_id UUID,
  p_is_credit BOOLEAN
) RETURNS BOOLEAN AS $$
DECLARE
  v_selected_date DATE;
  v_selected_time TEXT;
  v_duration INT;
  v_email TEXT;
  v_has_conflict BOOLEAN;
  v_remaining_credits INT;
  v_user_package_id UUID;
  v_used_package_credit BOOLEAN;
  v_booking_status TEXT;
  v_payment_processed BOOLEAN;
BEGIN
  -- 1. Fetch booking details
  SELECT selected_date::DATE, selected_time, duration, email, used_package_credit, booking_status, payment_processed
  INTO v_selected_date, v_selected_time, v_duration, v_email, v_used_package_credit, v_booking_status, v_payment_processed
  FROM public.bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking draft not found';
  END IF;

  -- 2. If already confirmed or payment_processed is true, return true (idempotent success)
  IF v_booking_status = 'confirmed' OR v_payment_processed THEN
    RETURN TRUE;
  END IF;

  -- 3. Acquire transaction-level advisory lock on the date hash to serialize bookings on the same day
  PERFORM pg_advisory_xact_lock(hashtext(v_selected_date::TEXT));

  -- 4. Check for overlaps (including 30 min buffer)
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.selected_date = v_selected_date
      AND b.booking_status = 'confirmed'
      AND b.id <> p_booking_id
      AND (
        (v_selected_time::TIME, (v_selected_time::TIME + (v_duration + 30 || ' minutes')::INTERVAL))
        OVERLAPS
        (b.selected_time::TIME, (b.selected_time::TIME + (b.duration + 30 || ' minutes')::INTERVAL))
      )
  ) INTO v_has_conflict;

  IF v_has_conflict THEN
    RAISE EXCEPTION 'This slot has already been booked. Please choose another gentle time.';
  END IF;

  -- 5. If credit booking, perform atomic credit check and deduction
  IF p_is_credit THEN
    -- Check user packages first (oldest active package first)
    SELECT id, remaining_credits INTO v_user_package_id, v_remaining_credits
    FROM public.user_packages
    WHERE LOWER(user_email) = LOWER(v_email) AND status = 'active' AND remaining_credits > 0
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_user_package_id IS NOT NULL THEN
      -- Deduct from user package
      UPDATE public.user_packages
      SET remaining_credits = remaining_credits - 1,
          used_credits = used_credits + 1,
          status = CASE WHEN remaining_credits - 1 = 0 THEN 'completed' ELSE 'active' END
      WHERE id = v_user_package_id;
    ELSE
      -- Fallback to membership_credits table
      SELECT remaining_credits INTO v_remaining_credits
      FROM public.membership_credits
      WHERE user_id = p_user_id FOR UPDATE;

      IF v_remaining_credits IS NULL OR v_remaining_credits < 1 THEN
        RAISE EXCEPTION 'Insufficient sanctuary credits to confirm this booking.';
      END IF;

      UPDATE public.membership_credits
      SET remaining_credits = remaining_credits - 1,
          used_credits = used_credits + 1,
          updated_at = now()
      WHERE user_id = p_user_id;
    END IF;

    -- Update booking status to confirmed
    UPDATE public.bookings
    SET booking_status = 'confirmed',
        payment_status = 'paid',
        stripe_payment_status = 'paid',
        used_package_credit = TRUE,
        payment_processed = TRUE,
        user_id = p_user_id,
        updated_at = now()
    WHERE id = p_booking_id;

  ELSE
    -- Stripe booking: update payment_processed = true and booking_status = 'confirmed'
    UPDATE public.bookings
    SET booking_status = 'confirmed',
        payment_status = 'paid',
        stripe_payment_status = 'paid',
        payment_processed = TRUE,
        user_id = p_user_id,
        updated_at = now()
    WHERE id = p_booking_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 3. CREATE ATOMIC CREDIT REFUND RPC
-- ==========================================

CREATE OR REPLACE FUNCTION public.refund_booking_credit(
  p_booking_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_email TEXT;
  v_user_id UUID;
  v_used_package_credit BOOLEAN;
  v_user_package_id UUID;
BEGIN
  -- 1. Fetch booking details
  SELECT email, user_id, used_package_credit
  INTO v_email, v_user_id, v_used_package_credit
  FROM public.bookings
  WHERE id = p_booking_id;

  IF NOT v_used_package_credit THEN
    RETURN FALSE;
  END IF;

  -- 2. Refund to user_packages
  -- We find a package with used_credits > 0 and same email, newest first
  SELECT id INTO v_user_package_id
  FROM public.user_packages
  WHERE LOWER(user_email) = LOWER(v_email) AND used_credits > 0
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_user_package_id IS NOT NULL THEN
    UPDATE public.user_packages
    SET remaining_credits = remaining_credits + 1,
        used_credits = GREATEST(0, used_credits - 1),
        status = 'active'
    WHERE id = v_user_package_id;
  END IF;

  -- 3. Refund to membership_credits
  IF v_user_id IS NOT NULL THEN
    UPDATE public.membership_credits
    SET remaining_credits = remaining_credits + 1,
        used_credits = GREATEST(0, used_credits - 1),
        updated_at = now()
    WHERE user_id = v_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
