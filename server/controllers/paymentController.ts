import { Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { bookingService } from '../services/bookingService';
import { authService } from '../services/authService';
import { supabaseAdmin } from '../config/supabase';
import { fromZonedTime } from 'date-fns-tz';
import { zoomService } from '../services/zoomService';
import { emailService } from '../services/emailService';
import { sanitizeInput } from '../utils/sanitize';

function parseIntentions(intentionsStr: string | null) {
  if (!intentionsStr) return { journeyType: '', intentions: '' };
  const match = intentionsStr.match(/^\[Journey:\s*([^\]]+)\]\s*(.*)/s);
  if (match) {
    return {
      journeyType: match[1].trim(),
      intentions: match[2].trim()
    };
  }
  return { journeyType: '', intentions: intentionsStr };
}

// Global lock set to prevent concurrent confirmation runs for the same session ID
const activeConfirmations = new Set<string>();

// Shared helper to confirm booking upon successful checkout
async function confirmPaymentSession(session_id: string): Promise<{ booking: any; isNew: boolean; loginUrl?: string }> {
  if (activeConfirmations.has(session_id)) {
    console.log('[confirmPaymentSession] Already processing session:', session_id);
    throw new Error('Confirmation already in progress');
  }

  activeConfirmations.add(session_id);

  try {
    // 1. Retrieve session from Stripe
    console.log(`[confirmPaymentSession] Retrieving session from Stripe for ID: ${session_id}`);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Stripe status: ${session.payment_status}`);
    }

    // 2. Check for existing booking with this payment ID (idempotency)
    const { data: existingBooking } = await bookingService.getBookingByPaymentId(session_id);

    if (existingBooking && existingBooking.bookingStatus === 'confirmed') {
      console.log('[confirmPaymentSession] Booking is already confirmed in DB:', session_id);
      
      const client = supabaseAdmin || require('../config/supabase').supabase;
      const { data: profile } = await client
        .from('user_profiles')
        .select('created_at')
        .eq('email', existingBooking.email)
        .maybeSingle();

      const isProfileRecent = profile && (Date.now() - new Date(profile.created_at).getTime() < 5 * 60 * 1000);

      // Try generating login link for idempotency page reload as well
      let loginUrl: string | undefined = undefined;
      try {
        const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
        const autoLogin = await authService.generateAutoLoginLink(existingBooking.email, redirectTo);
        if (autoLogin) loginUrl = autoLogin;
      } catch (e) {
        console.error('[confirmPaymentSession] Error generating auto login link in idempotency path:', e);
      }

      return {
        booking: existingBooking,
        isNew: !!isProfileRecent,
        loginUrl
      };
    }

    const meta = session.metadata;
    if (!meta) {
      throw new Error('No metadata found in Stripe session');
    }

    // 3. Auto account creation / profile check
    console.log(`[confirmPaymentSession] Provisioning account for: ${meta.email}`);
    const { userId, isNew } = await authService.provisionUserAccount(meta.email, meta.fullName);
    console.log(`[confirmPaymentSession] Account provisioned. User ID: ${userId}, isNew: ${isNew}`);

    let loginUrl: string | undefined = undefined;
    try {
      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
      const autoLogin = await authService.generateAutoLoginLink(meta.email, redirectTo);
      if (autoLogin) loginUrl = autoLogin;
    } catch (e) {
      console.error('[confirmPaymentSession] Error generating auto login link in main path:', e);
    }

    let booking: any;

    if (existingBooking && (existingBooking.bookingStatus === 'pending_payment' || existingBooking.bookingStatus === 'draft')) {
      console.log(`[confirmPaymentSession] Confirming existing booking draft: ${existingBooking.id}`);

      let confirmSuccess = false;
      let conflictDetected = false;

      try {
        const { data, error: confirmErr } = await supabaseAdmin.rpc('confirm_booking_transactional', {
          p_booking_id: existingBooking.id,
          p_user_id: userId || null,
          p_is_credit: false
        });

        if (confirmErr) {
          if (confirmErr.message && confirmErr.message.includes('already been booked')) {
            conflictDetected = true;
          } else {
            throw confirmErr;
          }
        } else {
          confirmSuccess = !!data;
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already been booked')) {
          conflictDetected = true;
        } else {
          throw err;
        }
      }

      if (!confirmSuccess && !conflictDetected) {
        // Lock not acquired because payment_processed was already true!
        console.warn('[confirmPaymentSession] Payment lock already set. Retrieving latest booking.');
        const { data: latestBooking } = await bookingService.getBookingByPaymentId(session_id);
        return {
          booking: latestBooking,
          isNew: false,
          loginUrl
        };
      }

      console.log('[PAYMENT LOCK ACQUIRED] successfully.');

      // If slot conflict happened but payment succeeded on Stripe, confirm anyway but flag for manual reschedule (Task 1 & Stripe instructions)
      if (conflictDetected) {
        console.warn('[confirmPaymentSession] Slot conflict detected for successful Stripe payment! Confirming booking with manual attention flag.');
        const { data: forceBooking, error: forceErr } = await supabaseAdmin
          .from('bookings')
          .update({
            booking_status: 'confirmed',
            payment_status: 'paid',
            stripe_payment_status: 'paid',
            payment_processed: true,
            zoom_status: 'needs_manual_attention',
            intentions: `[DOUBLE BOOKED CONFLICT] ${existingBooking.intentions || ''}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBooking.id)
          .select()
          .single();
          
        if (forceErr) throw forceErr;
        
        const parsed = parseIntentions(forceBooking.intentions);
        booking = {
          ...forceBooking,
          bookingReference: forceBooking.booking_reference,
          selectedDate: forceBooking.selected_date,
          selectedTime: forceBooking.selected_time,
          bookingStatus: forceBooking.booking_status,
          fullName: forceBooking.full_name,
          selectedSession: forceBooking.selected_session,
          sessionFormat: forceBooking.session_format,
          stripe_payment_id: forceBooking.stripe_payment_id,
          packageName: forceBooking.package_name,
          packagePrice: forceBooking.package_price,
          packageCredits: forceBooking.package_credits,
          zoomStatus: forceBooking.zoom_status,
          createdAt: forceBooking.created_at,
          updatedAt: forceBooking.updated_at,
          journeyType: parsed.journeyType,
          intentions: parsed.intentions,
          zoomMeetingId: forceBooking.zoom_meeting_id,
          zoomJoinUrl: forceBooking.zoom_join_url,
          zoomStartUrl: forceBooking.zoom_start_url,
          meetingPassword: forceBooking.meeting_password,
          meetingType: forceBooking.meeting_type,
          calendarStatus: forceBooking.calendar_status,
          reminderSent: forceBooking.reminder_sent,
          usedPackageCredit: forceBooking.used_package_credit,
          userId: forceBooking.user_id,
        };

        console.log(`[BOOKING CONFIRMED] Booking ${forceBooking.id} confirmed with conflict manual attention flag.`);
        await emailService.sendBookingConfirmation(booking);
        
        return {
          booking,
          isNew,
          loginUrl
        };
      }

      // Normal path: slot confirmed successfully
      const isVirtual = existingBooking.sessionFormat && existingBooking.sessionFormat.toLowerCase() === 'virtual';
      const dbUpdate: any = {
        updated_at: new Date().toISOString()
      };

      if (isVirtual) {
        try {
          const providerTimezone = 'America/New_York';
          const startUTC = fromZonedTime(`${existingBooking.selectedDate} ${existingBooking.selectedTime}:00`, providerTimezone);
          
          console.log('[confirmPaymentSession] Creating Zoom meeting for virtual session...');
          const zoomResult = await zoomService.createZoomMeeting({
            topic: `${existingBooking.selectedSession || 'Healing Session'} with Alanna`,
            startTime: startUTC.toISOString(),
            duration: Number(existingBooking.duration || 60),
          });

          dbUpdate.zoom_meeting_id = zoomResult.meetingId;
          dbUpdate.zoom_join_url = zoomResult.joinUrl;
          dbUpdate.zoom_start_url = zoomResult.hostUrl;
          dbUpdate.meeting_password = zoomResult.password;
          dbUpdate.meeting_type = '2';
          dbUpdate.calendar_status = 'scheduled';
          dbUpdate.zoom_status = 'success';
          console.log('[ZOOM CREATED] Zoom meeting setup completed.');
        } catch (zoomErr: any) {
          console.error('[ZOOM FAILED] Zoom API failed during confirmPaymentSession:', zoomErr.message || zoomErr);
          console.log('[ROLLBACK TRIGGERED] Zoom setup failed, proceeding without rollback.');
          dbUpdate.zoom_status = 'needs_manual_attention';
          dbUpdate.zoom_meeting_id = null;
          dbUpdate.zoom_join_url = null;
          dbUpdate.zoom_start_url = null;
          dbUpdate.meeting_password = null;
          dbUpdate.meeting_type = null;
          dbUpdate.calendar_status = null;
        }
      }

      const { data: rawResult, error: updateErr } = await supabaseAdmin
        .from('bookings')
        .update(dbUpdate)
        .eq('id', existingBooking.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Log booking history if user_id is set
      if (userId) {
        const { error: histError } = await supabaseAdmin.rpc('log_booking_history', {
          p_user_id: userId,
          p_booking_id: rawResult.id,
          p_ritual_name: rawResult.selected_session,
          p_session_date_time: new Date(`${rawResult.selected_date}T${rawResult.selected_time}:00`).toISOString(),
          p_status: 'confirmed'
        });
        if (histError) console.error('[confirmPaymentSession] Error inserting booking history:', histError);
      }

      // Provision credits if they purchased a package
      let credits = existingBooking.packageCredits ? Number(existingBooking.packageCredits) : 1;
      let packageName = existingBooking.packageName || 'Single Session';
      
      const nameLower = packageName.toLowerCase();
      if (nameLower.includes('sanctuary') || nameLower.includes('10-class') || nameLower.includes('pass') || nameLower.includes('ten')) {
        credits = 10;
        packageName = 'Sanctuary';
      } else if (nameLower.includes('starter') || nameLower.includes('intro') || nameLower.includes('journey')) {
        credits = 3;
        packageName = 'Starter';
      } else if (nameLower.includes('single') || nameLower.includes('drop-in') || nameLower.includes('one')) {
        credits = 1;
        packageName = 'Single';
      }

      let validityMonths = 1;
      if (nameLower.includes('sanctuary') || nameLower.includes('10-class') || nameLower.includes('pass') || nameLower.includes('ten')) {
        validityMonths = 3;
      }

      if (existingBooking.packageId && credits >= 1) {
        console.log(`[confirmPaymentSession] Package purchased: ${packageName}. Provisioning ${credits} credits...`);
        
        let expiresAt: string | null = null;
        try {
          const { data: pkgData } = await supabaseAdmin
            .from('packages')
            .select('validity_months')
            .eq('id', existingBooking.packageId)
            .maybeSingle();
          
          const months = pkgData?.validity_months || validityMonths;
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + months);
          expiresAt = expiryDate.toISOString();
        } catch (e) {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
          expiresAt = expiryDate.toISOString();
        }

        // Insert user_packages: deduct first session credit immediately!
        await supabaseAdmin.from('user_packages').insert({
          user_email: existingBooking.email,
          package_id: existingBooking.packageId,
          stripe_payment_id: session_id,
          total_credits: credits,
          remaining_credits: credits - 1,
          used_credits: 1,
          expires_at: expiresAt,
          status: (credits - 1) === 0 ? 'completed' : 'active'
        });
        console.log('[CREDIT DEDUCTED] Deducted package credit for Stripe checkout booking.');

        if (userId) {
          await supabaseAdmin.rpc('create_or_update_membership_credits', {
            p_user_id: userId,
            p_email: existingBooking.email,
            p_total_credits: credits,
            p_remaining_credits: credits
          });
          await supabaseAdmin.rpc('deduct_membership_credit', {
            p_user_id: userId,
            p_count: 1
          });
          console.log('[CREDIT DEDUCTED] Deducted profile credit for Stripe checkout booking.');
        }
      }

      const parsed = parseIntentions(rawResult.intentions);
      booking = {
        ...rawResult,
        bookingReference: rawResult.booking_reference,
        selectedDate: rawResult.selected_date,
        selectedTime: rawResult.selected_time,
        bookingStatus: rawResult.booking_status,
        fullName: rawResult.full_name,
        selectedSession: rawResult.selected_session,
        sessionFormat: rawResult.session_format,
        stripe_payment_id: rawResult.stripe_payment_id,
        packageName: rawResult.package_name,
        packagePrice: rawResult.package_price,
        packageCredits: rawResult.package_credits,
        createdAt: rawResult.created_at,
        updatedAt: rawResult.updated_at,
        journeyType: parsed.journeyType,
        intentions: parsed.intentions,
        zoomMeetingId: rawResult.zoom_meeting_id,
        zoomJoinUrl: rawResult.zoom_join_url,
        zoomStartUrl: rawResult.zoom_start_url,
        meetingPassword: rawResult.meeting_password,
        meetingType: rawResult.meeting_type,
        calendarStatus: rawResult.calendar_status,
        reminderSent: rawResult.reminder_sent,
        zoomStatus: rawResult.zoom_status,
        usedPackageCredit: rawResult.used_package_credit,
        userId: rawResult.user_id,
      };

      console.log(`[BOOKING CONFIRMED] Stripe checkout booking ${rawResult.id} confirmed successfully.`);
      await emailService.sendBookingConfirmation(booking);
    } else {
      // Fallback: create new booking
      console.log('[confirmPaymentSession] No draft found. Creating new booking...');
      booking = await bookingService.createBooking({
        fullName: meta.fullName,
        email: meta.email,
        selectedSession: meta.selectedSession,
        duration: parseInt(meta.duration),
        selectedDate: meta.selectedDate,
        selectedTime: meta.selectedTime,
        intentions: meta.intentions,
        emotion: meta.emotion,
        timezone: meta.timezone,
        sessionFormat: meta.sessionFormat,
        stripe_payment_id: session_id,
        packageId: meta.packageId,
        packageName: meta.packageName,
        packagePrice: meta.packagePrice ? parseFloat(meta.packagePrice) : undefined,
        packageCredits: meta.packageCredits ? parseInt(meta.packageCredits) : undefined,
        journeyType: meta.journeyType || '',
        userId: userId || null
      });
    }

    if (isNew) {
      const welcomeLink = loginUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
      console.log(`[confirmPaymentSession] Dispatching Welcome Email to new user: ${booking.email} with link: ${welcomeLink}`);
      await emailService.sendWelcomeEmail(booking.email, booking.fullName, welcomeLink, booking);
    }

    return { booking, isNew, loginUrl };
  } finally {
    activeConfirmations.delete(session_id);
  }
}

export const paymentController = {
  async createCheckoutSession(req: Request, res: Response) {
    let { 
      bookingId,
      fullName, 
      email, 
      selectedSession, 
      duration, 
      selectedDate, 
      selectedTime, 
      intentions, 
      emotion, 
      timezone, 
      sessionFormat,
      selectedPackage,
      journeyType
    } = req.body;

    fullName = sanitizeInput(fullName);
    intentions = sanitizeInput(intentions);

    try {
      const packagePrice = selectedPackage?.price || 45; // Fallback to $45
      const packageName = selectedPackage?.name || 'Single Session';
      const packageCredits = selectedPackage?.credits || 1;

      console.log('--- STRIPE CHECKOUT SESSION CREATION ---');
      console.log('User Email:', email);
      console.log('Full Name:', fullName);
      console.log('Selected Session:', selectedSession);
      console.log('Duration:', duration);
      console.log('Package:', packageName);
      console.log('Booking ID:', bookingId);
      console.log('Success URL:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${packageName}: ${selectedSession}`,
                description: `${duration} minute ${sessionFormat} ritual journey`,
              },
              unit_amount: packagePrice * 100, // Price in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?booking_cancelled=true`,
        metadata: {
          fullName,
          email,
          selectedSession,
          duration: duration.toString(),
          selectedDate,
          selectedTime,
          intentions: intentions || '',
          emotion,
          timezone,
          sessionFormat,
          packageId: selectedPackage?.id || '',
          packageName,
          packagePrice: packagePrice.toString(),
          packageCredits: packageCredits.toString(),
          journeyType: journeyType || '',
          bookingId: bookingId || '',
        },
      });

      console.log('Created Stripe Checkout Session ID:', session.id);
      
      // Update booking status and stripe_payment_id
      if (bookingId) {
        console.log(`[createCheckoutSession] Updating booking ${bookingId} status to pending_payment, stripe_payment_id = ${session.id}`);
        const { error: updateErr } = await supabaseAdmin
          .from('bookings')
          .update({
            stripe_payment_id: session.id,
            booking_status: 'pending_payment',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);
        
        if (updateErr) {
          console.error('[createCheckoutSession] Error updating booking status in database:', updateErr);
        }
      }

      console.log('Session Metadata:', JSON.stringify(session.metadata, null, 2));
      console.log('----------------------------------------');

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe Session Error:', error);
      res.status(500).json({ error: `Failed to initialize sanctuary payment: ${error.message || error}` });
    }
  },

  async confirmPayment(req: Request, res: Response) {
    console.log('[PAYMENT CONFIRM]');
    const { session_id } = req.body;

    if (!session_id) {
      console.error("Confirmation Error: Missing session ID");
      return res.status(400).json({ error: 'Missing session ID' });
    }

    try {
      const { booking, isNew, loginUrl } = await confirmPaymentSession(session_id);
      res.json({
        success: true,
        booking,
        isNew,
        loginUrl
      });
    } catch (error: any) {
      console.error('Payment Confirmation Error:', error);
      res.status(500).json({ error: `Payment confirmation failed: ${error.message || error}` });
    }
  },

  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        throw new Error('Raw body not captured. Check express.json middleware configuration.');
      }
      
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.warn('⚠️ STRIPE_WEBHOOK_SECRET is not configured. Webhook signature checking bypassed.');
        event = req.body;
      } else {
        event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
      }
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[WEBHOOK RECEIVED] Stripe event type: ${event.type}`);

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`[Stripe Webhook] Processing checkout.session.completed: ${session.id}`);
        await confirmPaymentSession(session.id);
        console.log('[PAYMENT COMPLETED] Booking successfully confirmed and processed via Webhook.');
      } else if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log(`[Stripe Webhook] Payment intent succeeded: ${paymentIntent.id}`);
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        console.log(`[Stripe Webhook] Payment intent failed: ${paymentIntent.id}`);
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('[Stripe Webhook] Error processing event:', error);
      res.status(500).json({ error: error.message || 'Webhook processing failed' });
    }
  }
};
