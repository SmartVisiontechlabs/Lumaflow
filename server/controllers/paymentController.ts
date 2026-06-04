import { Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { bookingService } from '../services/bookingService';
import { authService } from '../services/authService';
import { supabaseAdmin } from '../config/supabase';
import { fromZonedTime } from 'date-fns-tz';
import { zoomService } from '../services/zoomService';
import { emailService } from '../services/emailService';

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

export const paymentController = {
  async createCheckoutSession(req: Request, res: Response) {
    const { 
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
    console.log("req.body:", JSON.stringify(req.body, null, 2));
    console.log("req.query:", JSON.stringify(req.query, null, 2));

    const { session_id } = req.body;

    if (!session_id) {
      console.error("Confirmation Error: Missing session ID");
      return res.status(400).json({ error: 'Missing session ID' });
    }

    if (activeConfirmations.has(session_id)) {
      console.log('[confirmPayment] Request already in progress for session ID:', session_id);
      return res.status(409).json({ error: 'Confirmation already in progress. Please wait.' });
    }

    activeConfirmations.add(session_id);

    try {
      // 1. Retrieve session from Stripe
      console.log(`[confirmPayment] Retrieving session from Stripe for ID: ${session_id}`);
      const session = await stripe.checkout.sessions.retrieve(session_id);
      console.log(`[confirmPayment] Stripe session retrieved. Payment status: ${session.payment_status}`);

      console.log(`[confirmPayment] Validating payment_intent. Status: ${session.payment_status}, Intent ID: ${session.payment_intent}`);
      if (session.payment_status !== 'paid') {
        console.error(`[confirmPayment] Payment status not paid: ${session.payment_status}`);
        return res.status(400).json({ error: `Payment not completed. Stripe Payment Status: ${session.payment_status}` });
      }

      console.log('[STRIPE VERIFIED]');

      // 2. Check for existing booking with this payment ID (idempotency)
      console.log(`[confirmPayment] Checking for existing booking for payment ID: ${session_id}`);
      const { data: existingBooking, error: checkError } = await bookingService.getBookingByPaymentId(session_id);
      
      if (existingBooking && existingBooking.bookingStatus === 'confirmed') {
        console.log('DUPLICATE PAYMENT CONFIRMATION PREVENTED, RETURNING EXISTING:', session_id);
        console.log('Existing Booking Reference:', existingBooking.bookingReference);
        console.log('[BOOKING COMPLETE]');
        
        let actionLink: string | undefined;
        if (supabaseAdmin) {
          try {
            const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard`;
            console.log(`[confirmPayment] Generating silent reauth link for duplicate confirm request: ${existingBooking.email}`);
            const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
              type: 'magiclink',
              email: existingBooking.email,
              options: {
                redirectTo
              }
            });
            if (linkErr) {
              console.error('[confirmPayment] Error generating silent reauth link for duplicate confirm:', linkErr);
            } else if (linkData?.properties?.action_link) {
              actionLink = linkData.properties.action_link;
            }
          } catch (e) {
            console.error('[confirmPayment] Exception generating silent reauth link for duplicate confirm:', e);
          }
        }

        return res.json({
          success: true,
          booking: existingBooking,
          alreadyProcessed: true,
          isNew: false,
          actionLink
        });
      }

      if (checkError) {
        console.error('Idempotency Check Error (non-blocking):', checkError);
      }

      // 3. Extract metadata
      const meta = session.metadata;
      if (!meta) {
        console.error('[confirmPayment] No metadata found in Stripe session');
        throw new Error('No metadata found in Stripe session');
      }
      console.log('[confirmPayment] Session metadata:', JSON.stringify(meta, null, 2));

      // 3.5 Auto account creation / profile check
      console.log(`[confirmPayment] Provisioning account for: ${meta.email}`);
      const { userId, isNew, actionLink } = await authService.provisionUserAccount(meta.email, meta.fullName);
      console.log(`[confirmPayment] Account provisioned with User ID: ${userId}, isNew: ${isNew}`);

      let booking: any;

      if (existingBooking && (existingBooking.bookingStatus === 'pending_payment' || existingBooking.bookingStatus === 'draft')) {
        console.log(`[confirmPayment] Found draft/pending booking ${existingBooking.id} with status ${existingBooking.bookingStatus}. Confirming it...`);
        
        const isVirtual = existingBooking.sessionFormat && existingBooking.sessionFormat.toLowerCase() === 'virtual';
        const dbUpdate: any = {
          booking_status: 'confirmed',
          payment_status: 'paid',
          stripe_payment_status: 'paid',
          user_id: userId || null,
          used_package_credit: existingBooking.packageId ? true : false,
          updated_at: new Date().toISOString()
        };

        if (isVirtual) {
          const providerTimezone = 'America/New_York';
          const startUTC = fromZonedTime(`${existingBooking.selectedDate} ${existingBooking.selectedTime}:00`, providerTimezone);
          
          console.log('[confirmPayment] Creating Zoom meeting for virtual session...');
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
          if (histError) console.error('[confirmPayment] Error inserting booking history:', histError);
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
          console.log(`[confirmPayment] Package purchased: ${packageName}. Provisioning ${credits} credits...`);
          
          // Calculate expiry date
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
            console.log(`[confirmPayment] Package validity is ${months} months. Expires at: ${expiresAt}`);
          } catch (e) {
            console.error('[confirmPayment] Could not fetch package validity from DB:', e);
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
            expiresAt = expiryDate.toISOString();
          }

          // Mark payment_processed so it's not processed multiple times
          const { data: updatedBooking, error: lockErr } = await supabaseAdmin
            .from('bookings')
            .update({ payment_processed: true })
            .eq('id', rawResult.id)
            .eq('payment_processed', false)
            .select();

          const lockAcquired = updatedBooking && updatedBooking.length > 0;
          if (lockAcquired) {
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

            if (userId) {
              // Provision full credits first
              await supabaseAdmin.rpc('create_or_update_membership_credits', {
                p_user_id: userId,
                p_email: existingBooking.email,
                p_total_credits: credits,
                p_remaining_credits: credits
              });
              // Deduct initial credit immediately
              await supabaseAdmin.rpc('deduct_membership_credit', {
                p_user_id: userId,
                p_count: 1
              });
            }
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

        // Send booking confirmation email
        await emailService.sendBookingConfirmation(booking);
      } else {
        // Fallback: Create booking using backend service (old flow)
        console.log('[confirmPayment] No draft found. Creating new booking...');
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
      
      console.log('[confirmPayment] Booking successfully created/confirmed:', booking.bookingReference);
      console.log('[BOOKING COMPLETE]');

      res.json({
        success: true,
        booking: booking,
        isNew: isNew,
        actionLink: actionLink
      });
    } catch (error: any) {
      console.error('Payment Confirmation Outer Catch Error:', error);
      res.status(500).json({ error: `Payment confirmation failed: ${error.message || error}` });
    } finally {
      activeConfirmations.delete(session_id);
    }
  }
};
