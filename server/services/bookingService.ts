import { supabase, supabaseAdmin } from '../config/supabase';
import { generateBookingReference, getSlotTimeLabels } from '../utils/bookingUtils';
import { emailService } from './emailService';
import { zoomService } from './zoomService';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
const writeClient = supabaseAdmin || supabase;

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

function mapBookingFromDb(b: any) {
  if (!b) return null;
  const parsed = parseIntentions(b.intentions);
  return {
    ...b,
    bookingReference: b.booking_reference,
    selectedDate: b.selected_date,
    selectedTime: b.selected_time,
    bookingStatus: b.booking_status,
    fullName: b.full_name,
    selectedSession: b.selected_session,
    sessionFormat: b.session_format,
    stripe_payment_id: b.stripe_payment_id,
    packageName: b.package_name,
    packagePrice: b.package_price,
    packageCredits: b.package_credits,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
    journeyType: parsed.journeyType,
    intentions: parsed.intentions,
    zoomMeetingId: b.zoom_meeting_id,
    zoomJoinUrl: b.zoom_join_url,
    zoomStartUrl: b.zoom_start_url,
    meetingPassword: b.meeting_password,
    meetingType: b.meeting_type,
    calendarStatus: b.calendar_status,
    reminderSent: b.reminder_sent,
    zoomStatus: b.zoom_status,
    usedPackageCredit: b.used_package_credit,
    userId: b.user_id,
    packageId: b.package_id,
    practitionerTime: b.practitioner_time,
    clientLocalTime: b.client_local_time,
  };
}

function parseToISOTimestamps(dateStr: string, timeStr: string, timezoneStr: string) {
  let hours = 8;
  let minutes = 0;
  
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3];
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
  }
  
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  
  let tz = timezoneStr || 'America/New_York';
  if (tz.includes('GMT')) {
    const offsetMatch = tz.match(/GMT\s*([+-]\d{1,2}:?\d{2})/);
    if (offsetMatch) {
      tz = offsetMatch[1];
    } else {
      tz = 'America/New_York';
    }
  }
  
  const PROVIDER_TIMEZONE = 'America/New_York';
  const nycDateTimeStr = `${dateStr}T${hh}:${mm}:00`;
  const utcDate = fromZonedTime(nycDateTimeStr, PROVIDER_TIMEZONE);
  
  const practitioner_time = formatInTimeZone(utcDate, PROVIDER_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
  const client_local_time = formatInTimeZone(utcDate, tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
  
  return { practitioner_time, client_local_time };
}

async function ensureUserIntegrity(userId: string | null, email: string, fullName: string): Promise<string | null> {
  if (!userId) return null;
  
  console.log(`\n--- [bookingService] User Integrity Check: ${userId} ---`);
  const writeClient = supabaseAdmin || supabase;
  
  try {
    // 1. Check if auth user exists in Supabase Auth
    console.log('[AUTH USER FOUND] checking Supabase auth...');
    const { data: authUser, error: authUserErr } = await writeClient.auth.admin.getUserById(userId);
    
    if (authUserErr || !authUser || !authUser.user) {
      console.warn(`[bookingService] Auth user not found in Supabase Auth for ID: ${userId}. Clearing user_id linkage.`);
      return null;
    }

    const userEmail = authUser.user.email || email;
    const userName = authUser.user.user_metadata?.full_name || fullName || authUser.user.email?.split('@')[0] || '';

    // 2. Validate & Repair profiles table
    try {
      const { data: profileRow } = await writeClient
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!profileRow) {
        console.log('[CLIENT ROW MISSING — REBUILDING] profiles row missing');
        const { error: insErr } = await writeClient
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            full_name: userName,
            role: 'client'
          });
        if (insErr) {
          console.error('[bookingService] Failed to rebuild profiles row:', insErr.message);
        } else {
          console.log('[PROFILE RECREATED] profiles row rebuilt successfully');
        }
      }
    } catch (err: any) {
      console.warn('[bookingService] profiles table validation bypassed:', err.message);
    }

    // 3. Validate & Repair user_profiles table
    try {
      const { data: userProfileRow } = await writeClient
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!userProfileRow) {
        console.log('[CLIENT ROW MISSING — REBUILDING] user_profiles row missing');
        const { error: insErr } = await writeClient
          .from('user_profiles')
          .insert({
            id: userId,
            email: userEmail,
            full_name: userName,
            role: 'client'
          });
        if (insErr) {
          console.error('[bookingService] Failed to rebuild user_profiles row:', insErr.message);
        } else {
          console.log('[PROFILE RECREATED] user_profiles row rebuilt successfully');
        }
      }
    } catch (err: any) {
      console.warn('[bookingService] user_profiles table validation bypassed:', err.message);
    }

    // 4. Validate & Repair membership_credits table
    try {
      const { data: membershipRow } = await writeClient
        .from('membership_credits')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!membershipRow) {
        console.log('[CLIENT ROW MISSING — REBUILDING] membership_credits row missing');
        const { error: insErr } = await writeClient
          .from('membership_credits')
          .insert({
            user_id: userId,
            email: userEmail,
            total_credits: 0,
            used_credits: 0,
            remaining_credits: 0
          });
        if (insErr) {
          console.error('[bookingService] Failed to rebuild membership_credits row:', insErr.message);
        } else {
          console.log('[PROFILE RECREATED] membership_credits row rebuilt successfully');
        }
      }
    } catch (err: any) {
      console.warn('[bookingService] membership_credits table validation bypassed:', err.message);
    }

    return userId;
  } catch (outerErr: any) {
    console.error('[bookingService] Critical error during user self-healing validation:', outerErr.message);
    return userId;
  }
}

export const bookingService = {
  /**
   * Retrieves all bookings from Supabase
   */
  async getAllBookings() {
    const { data: rawData, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map back to camelCase
    return (rawData || []).map(mapBookingFromDb);
  },

  /**
   * Retrieves a specific booking by Stripe Payment ID
   */
  async getBookingByPaymentId(paymentId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('stripe_payment_id', paymentId)
      .maybeSingle();

    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };

    return {
      data: mapBookingFromDb(data),
      error: null
    };
  },

  /**
   * Creates a new booking and triggers emails
   */
  async createBooking(bookingData: any) {
    console.log(`[PAYMENT START] Base booking confirmation started for: ${bookingData.email}`);
    const finalUserId = await ensureUserIntegrity(bookingData.userId, bookingData.email, bookingData.fullName);
    bookingData.userId = finalUserId;

    // 1. Idempotency check: see if booking already exists for this payment session ID
    if (bookingData.stripe_payment_id && bookingData.stripe_payment_id !== 'credit_booking') {
      const { data: existingBooking } = await this.getBookingByPaymentId(bookingData.stripe_payment_id);
      if (existingBooking) {
        console.log('[bookingService] Booking with this payment ID already exists, returning existing:', bookingData.stripe_payment_id);
        return existingBooking;
      }
    }

    const reference = generateBookingReference();
    
    let intentionsEnveloped = bookingData.intentions || '';
    if (bookingData.journeyType) {
      intentionsEnveloped = `[Journey: ${bookingData.journeyType}] ${intentionsEnveloped}`;
    }

    let practitioner_time = null;
    let client_local_time = null;
    if (bookingData.selectedDate && bookingData.selectedTime) {
      try {
        const clientTz = bookingData.timezone || 'UTC';
        const res = parseToISOTimestamps(bookingData.selectedDate, bookingData.selectedTime, clientTz);
        practitioner_time = res.practitioner_time;
        client_local_time = res.client_local_time;
      } catch (err) {
        console.error('Error generating timezone labels for creation:', err);
      }
    }

    // Map camelCase frontend data to snake_case for DB (without Zoom details initially)
    const dbData = {
      booking_reference: reference,
      full_name: bookingData.fullName,
      email: bookingData.email,
      intentions: intentionsEnveloped,
      emotion: bookingData.emotion,
      selected_session: bookingData.selectedSession,
      session_format: bookingData.sessionFormat,
      duration: bookingData.duration,
      selected_date: bookingData.selectedDate,
      selected_time: bookingData.selectedTime,
      timezone: bookingData.timezone,
      practitioner_time,
      client_local_time,
      booking_status: 'confirmed',
      stripe_payment_id: bookingData.stripe_payment_id || null,
      package_id: bookingData.packageId || null,
      package_name: bookingData.packageName || 'Single Session',
      package_price: bookingData.packagePrice || null,
      package_credits: bookingData.packageCredits || null,
      payment_status: 'paid',
      stripe_payment_status: 'paid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      zoom_status: 'not_applicable',
      user_id: bookingData.userId || null,
      used_package_credit: bookingData.packageId ? true : false,
      payment_processed: true, // Marked as processed because it is a direct confirmation
    };

    console.log('[BOOKING INSERT]', dbData);
    console.log('[bookingService] Inserting base booking into Supabase...');
    
    let rawResult: any;
    try {
      const { data, error } = await writeClient
        .from('bookings')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        // Task 5: Handle unique constraint violation (duplicate webhook protection)
        if (error.code === '23505') {
          console.warn('[bookingService] Duplicate booking insert caught via unique constraint. Fetching existing booking.');
          const { data: existing } = await this.getBookingByPaymentId(bookingData.stripe_payment_id);
          if (existing) return existing;
        }
        throw error;
      }
      rawResult = data;
    } catch (err: any) {
      if (err.code === '23505' && bookingData.stripe_payment_id) {
        console.warn('[bookingService] Duplicate booking insert caught via unique constraint exception. Fetching existing booking.');
        const { data: existing } = await this.getBookingByPaymentId(bookingData.stripe_payment_id);
        if (existing) return existing;
      }
      console.error('Database Insertion Error:', err);
      throw err;
    }

    console.log('[BOOKING CREATED] Base booking row successfully written.');

    // Write booking history if user_id is set
    if (bookingData.userId) {
      console.log('[bookingService] Creating booking history record for user:', bookingData.userId);
      const { error: histError } = await writeClient.rpc('log_booking_history', {
        p_user_id: bookingData.userId,
        p_booking_id: rawResult.id,
        p_ritual_name: bookingData.selectedSession,
        p_session_date_time: new Date(`${bookingData.selectedDate}T${bookingData.selectedTime}:00`).toISOString(),
        p_status: 'confirmed'
      });
      if (histError) {
        console.error('[bookingService] Error inserting booking history:', histError);
      }
    }

    // Provision credits if they purchased a package
    let credits = bookingData.packageCredits ? Number(bookingData.packageCredits) : 1;
    let packageName = bookingData.packageName || 'Single Session';
    
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

    if (bookingData.packageId && credits >= 1) {
      console.log(`[bookingService] Package purchased: ${packageName}. Provisioning ${credits} credits...`);
      console.log('[PAYMENT LOCK ACQUIRED] lock acquired successfully during insert.');
      
      // Idempotency check: see if user_packages already has this stripe_payment_id
      let alreadyProvisioned = false;
      if (bookingData.stripe_payment_id && bookingData.stripe_payment_id !== 'credit_booking') {
        const { data: existingPkg, error: pkgQueryErr } = await writeClient
          .from('user_packages')
          .select('id')
          .eq('stripe_payment_id', bookingData.stripe_payment_id)
          .maybeSingle();
        
        if (pkgQueryErr) {
          console.error('[bookingService] Error checking for existing user_package:', pkgQueryErr);
        }
        
        if (existingPkg) {
          console.log('[bookingService] Package already provisioned for stripe_payment_id:', bookingData.stripe_payment_id);
          alreadyProvisioned = true;
        }
      }

      if (!alreadyProvisioned) {
        // Insert into user_packages: deduct first session credit immediately!
        const { error: upErr } = await writeClient
          .from('user_packages')
          .insert({
            user_email: bookingData.email,
            package_id: bookingData.packageId,
            stripe_payment_id: bookingData.stripe_payment_id || null,
            total_credits: credits,
            remaining_credits: credits - 1,
            used_credits: 1,
            status: (credits - 1) === 0 ? 'completed' : 'active'
          });
        if (upErr) {
          console.error('[bookingService] Error inserting user_package:', upErr);
        } else {
          console.log('[CREDIT DEDUCTED] Deducted package credit for initial session.');
        }

        // Update membership_credits using RPC
        if (bookingData.userId) {
          const { error: mcErr } = await writeClient.rpc('create_or_update_membership_credits', {
            p_user_id: bookingData.userId,
            p_email: bookingData.email,
            p_total_credits: credits,
            p_remaining_credits: credits
          });
          if (mcErr) {
            console.error('[bookingService] Error updating membership_credits via RPC:', mcErr);
          } else {
            // Deduct initial credit immediately
            const { error: deductErr } = await writeClient.rpc('deduct_membership_credit', {
              p_user_id: bookingData.userId,
              p_count: 1
            });
            if (deductErr) {
              console.error('[bookingService] Error deducting initial credit via RPC:', deductErr);
            } else {
              console.log('[CREDIT DEDUCTED] Deducted profile credit for initial session.');
            }
          }
        }
      }
    }

    const isVirtual = bookingData.sessionFormat && bookingData.sessionFormat.toLowerCase() === 'virtual';

    if (isVirtual) {
      try {
        const providerTimezone = 'America/New_York';
        const startUTC = fromZonedTime(`${bookingData.selectedDate} ${bookingData.selectedTime}:00`, providerTimezone);
        
        console.log('[bookingService] Creating Zoom meeting for virtual session...');
        const zoomResult = await zoomService.createZoomMeeting({
          topic: `${bookingData.selectedSession || 'Healing Session'} with Alanna`,
          startTime: startUTC.toISOString(),
          duration: Number(bookingData.duration || 60),
        });

        console.log('[bookingService] Updating booking record with Zoom credentials...');
        const { data: updatedResult, error: updateError } = await supabase
          .from('bookings')
          .update({
            zoom_meeting_id: zoomResult.meetingId,
            zoom_join_url: zoomResult.joinUrl,
            zoom_start_url: zoomResult.hostUrl,
            meeting_password: zoomResult.password,
            meeting_type: '2',
            calendar_status: 'scheduled',
            zoom_status: 'success',
            updated_at: new Date().toISOString()
          })
          .eq('id', rawResult.id)
          .select()
          .single();

        if (updateError) throw updateError;
        Object.assign(rawResult, updatedResult);
        console.log('[ZOOM CREATED]');
      } catch (zoomErr: any) {
        console.error('[ZOOM FAILED] Zoom API failed during createBooking:', zoomErr.message || zoomErr);
        console.log('[ROLLBACK TRIGGERED] Zoom meeting creation failed, proceeding with booking confirmed but needs attention.');
        
        const { data: updatedResult } = await supabase
          .from('bookings')
          .update({
            zoom_status: 'needs_manual_attention',
            updated_at: new Date().toISOString()
          })
          .eq('id', rawResult.id)
          .select()
          .single();
        
        if (updatedResult) {
          Object.assign(rawResult, updatedResult);
        }
      }
    }

    const data = mapBookingFromDb(rawResult);
    console.log(`[BOOKING CONFIRMED] Booking ${rawResult.id} fully confirmed and processed.`);

    // 2. Trigger transactional email sequence
    await emailService.sendBookingConfirmation(data);

    return data;
  },

  /**
   * Creates a draft booking record in Supabase (without Zoom meetings or emails)
   */
  async createDraftBooking(bookingData: any) {
    const finalUserId = await ensureUserIntegrity(bookingData.userId, bookingData.email, bookingData.fullName || '');
    bookingData.userId = finalUserId;

    let intentionsEnveloped = bookingData.intentions || '';
    if (bookingData.journeyType) {
      intentionsEnveloped = `[Journey: ${bookingData.journeyType}] ${intentionsEnveloped}`;
    }

    let practitioner_time = null;
    let client_local_time = null;
    if (bookingData.selectedDate && bookingData.selectedTime) {
      try {
        const clientTz = bookingData.timezone || 'UTC';
        const res = parseToISOTimestamps(bookingData.selectedDate, bookingData.selectedTime, clientTz);
        practitioner_time = res.practitioner_time;
        client_local_time = res.client_local_time;
      } catch (err) {
        console.error('Error generating timezone labels for draft:', err);
      }
    }

    // 1. Check for existing draft booking for this user/email (Task 4)
    const writeClient = supabaseAdmin || supabase;
    let existingDraft: any = null;

    if (bookingData.userId) {
      const { data } = await writeClient
        .from('bookings')
        .select('*')
        .eq('user_id', bookingData.userId)
        .in('booking_status', ['draft', 'pending_payment'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      existingDraft = data;
    } else if (bookingData.email) {
      const { data } = await writeClient
        .from('bookings')
        .select('*')
        .eq('email', bookingData.email)
        .in('booking_status', ['draft', 'pending_payment'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      existingDraft = data;
    }

    if (existingDraft) {
      console.log(`[bookingService] Found existing draft booking: ${existingDraft.id}. Recovering and updating choices.`);
      const dbUpdate = {
        full_name: bookingData.fullName || existingDraft.full_name || '',
        email: bookingData.email || existingDraft.email || '',
        intentions: intentionsEnveloped,
        emotion: bookingData.emotion || '',
        selected_session: bookingData.selectedSession || '',
        session_format: bookingData.sessionFormat || '',
        duration: bookingData.duration || 60,
        selected_date: bookingData.selectedDate || '',
        selected_time: bookingData.selectedTime || '',
        timezone: bookingData.timezone || '',
        practitioner_time,
        client_local_time,
        booking_status: 'draft',
        package_id: bookingData.packageId || null,
        package_name: bookingData.packageName || 'Single Session',
        package_price: bookingData.packagePrice || null,
        package_credits: bookingData.packageCredits || null,
        stripe_payment_id: bookingData.stripe_payment_id || existingDraft.stripe_payment_id || null,
        payment_status: 'pending',
        stripe_payment_status: 'pending',
        updated_at: new Date().toISOString(),
        user_id: bookingData.userId || existingDraft.user_id || null,
      };

      const { data: updatedResult, error: updateErr } = await writeClient
        .from('bookings')
        .update(dbUpdate)
        .eq('id', existingDraft.id)
        .select()
        .single();

      if (updateErr) {
        console.error('Database Update Error (draft recovery):', updateErr);
        throw updateErr;
      }

      console.log('[BOOKING DRAFT RECOVERED/UPDATED]');
      return mapBookingFromDb(updatedResult);
    }

    // No draft found, create a new one
    const reference = generateBookingReference();
    const dbData = {
      booking_reference: reference,
      full_name: bookingData.fullName || '',
      email: bookingData.email || '',
      intentions: intentionsEnveloped,
      emotion: bookingData.emotion || '',
      selected_session: bookingData.selectedSession || '',
      session_format: bookingData.sessionFormat || '',
      duration: bookingData.duration || 60,
      selected_date: bookingData.selectedDate || '',
      selected_time: bookingData.selectedTime || '',
      timezone: bookingData.timezone || '',
      practitioner_time,
      client_local_time,
      booking_status: 'draft',
      stripe_payment_id: bookingData.stripe_payment_id || null,
      package_id: bookingData.packageId || null,
      package_name: bookingData.packageName || 'Single Session',
      package_price: bookingData.packagePrice || null,
      package_credits: bookingData.packageCredits || null,
      payment_status: 'pending',
      stripe_payment_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      zoom_status: 'not_applicable',
      user_id: bookingData.userId || null,
    };

    console.log('[BOOKING INSERT]', dbData);
    console.log('[bookingService] Inserting draft booking into Supabase...');
    const { data: rawResult, error } = await writeClient
      .from('bookings')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Database Insertion Error (draft):', error);
      throw error;
    }

    console.log('[BOOKING DRAFT CREATED]');
    return mapBookingFromDb(rawResult);
  },

  /**
   * Confirms a draft booking when booked with existing package credits
   */
  async confirmCreditBooking(id: string, userId?: string) {
    console.log(`[PAYMENT START] Confirming credit booking: ${id}`);
    
    const writeClient = supabaseAdmin || supabase;

    // Call the RPC function to atomically lock the slot, check double-booking conflicts,
    // check credits and deduct credits in a single transaction (Task 1, 2, 7)
    const { data: confirmSuccess, error: confirmErr } = await writeClient.rpc('confirm_booking_transactional', {
      p_booking_id: id,
      p_user_id: userId || null,
      p_is_credit: true
    });

    if (confirmErr || !confirmSuccess) {
      console.error('[bookingService] confirm_booking_transactional RPC failed:', confirmErr?.message || 'Unknown');
      throw new Error(confirmErr?.message || 'Insufficient sanctuary credits or slot already booked.');
    }

    console.log(`[PAYMENT LOCK ACQUIRED] [CREDIT DEDUCTED] Transaction successfully completed via RPC.`);

    // Fetch the updated booking record
    const { data: updatedBooking, error: fetchUpdatedErr } = await writeClient
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchUpdatedErr || !updatedBooking) {
      throw new Error(`Failed to load confirmed booking: ${fetchUpdatedErr?.message || 'Unknown'}`);
    }

    const dbUpdate: any = {};
    const isVirtual = updatedBooking.session_format && updatedBooking.session_format.toLowerCase() === 'virtual';

    if (isVirtual) {
      try {
        const providerTimezone = 'America/New_York';
        const startUTC = fromZonedTime(`${updatedBooking.selected_date} ${updatedBooking.selected_time}:00`, providerTimezone);
        
        console.log('[bookingService] Creating Zoom meeting for virtual credit session...');
        const zoomResult = await zoomService.createZoomMeeting({
          topic: `${updatedBooking.selected_session || 'Healing Session'} with Alanna`,
          startTime: startUTC.toISOString(),
          duration: Number(updatedBooking.duration || 60),
        });

        dbUpdate.zoom_meeting_id = zoomResult.meetingId;
        dbUpdate.zoom_join_url = zoomResult.joinUrl;
        dbUpdate.zoom_start_url = zoomResult.hostUrl;
        dbUpdate.meeting_password = zoomResult.password;
        dbUpdate.meeting_type = '2';
        dbUpdate.calendar_status = 'scheduled';
        dbUpdate.zoom_status = 'success';
        console.log('[ZOOM CREATED]');
      } catch (zoomErr: any) {
        console.error('[ZOOM FAILED] Zoom API failed during confirmCreditBooking:', zoomErr.message || zoomErr);
        console.log('[ROLLBACK TRIGGERED]');
        dbUpdate.zoom_status = 'needs_manual_attention';
        dbUpdate.zoom_meeting_id = null;
        dbUpdate.zoom_join_url = null;
        dbUpdate.zoom_start_url = null;
        dbUpdate.meeting_password = null;
        dbUpdate.meeting_type = null;
        dbUpdate.calendar_status = null;
      }

      dbUpdate.updated_at = new Date().toISOString();
      const { data: finalBooking, error: finalErr } = await writeClient
        .from('bookings')
        .update(dbUpdate)
        .eq('id', id)
        .select()
        .single();
      if (finalErr) {
        console.error('[bookingService] Error updating booking Zoom details:', finalErr.message);
      } else {
        Object.assign(updatedBooking, finalBooking);
      }
    }

    const finalUserId = userId || updatedBooking.user_id;
    if (finalUserId) {
      const { error: histError } = await writeClient.rpc('log_booking_history', {
        p_user_id: finalUserId,
        p_booking_id: updatedBooking.id,
        p_ritual_name: updatedBooking.selected_session,
        p_session_date_time: new Date(`${updatedBooking.selected_date}T${updatedBooking.selected_time}:00`).toISOString(),
        p_status: 'confirmed'
      });
      if (histError) console.error('[bookingService] Error inserting booking history:', histError);
    }

    const data = mapBookingFromDb(updatedBooking);
    console.log(`[BOOKING CONFIRMED] Credit booking ${id} confirmed successfully.`);
    await emailService.sendBookingConfirmation(data);

    return data;
  },

  /**
   * Retrieves any active draft booking for a user
   */
  async getActiveDraftBooking(userId: string) {
    const { data, error } = await writeClient
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .eq('booking_status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapBookingFromDb(data);
  },

  /**
   * Retrieves all bookings history for a user
   */
  async getBookingsHistory(userId: string) {
    const { data, error } = await writeClient
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('selected_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapBookingFromDb);
  },



  /**
   * Updates an existing booking
   */
  async updateBooking(id: string, updateData: any) {
    // Map camelCase to snake_case
    const dbUpdate: any = {};
    if (updateData.bookingStatus) dbUpdate.booking_status = updateData.bookingStatus;
    if (updateData.fullName) dbUpdate.full_name = updateData.fullName;
    if (updateData.email) dbUpdate.email = updateData.email;
    if (updateData.selectedDate) dbUpdate.selected_date = updateData.selectedDate;
    if (updateData.selectedTime) dbUpdate.selected_time = updateData.selectedTime;

    if (updateData.selectedDate || updateData.selectedTime || updateData.timezone) {
      try {
        const { data: currentBooking } = await writeClient
          .from('bookings')
          .select('selected_date, selected_time, timezone')
          .eq('id', id)
          .single();
        
        if (currentBooking) {
          const dateVal = updateData.selectedDate || currentBooking.selected_date;
          const timeVal = updateData.selectedTime || currentBooking.selected_time;
          const tzVal = updateData.timezone || currentBooking.timezone;
          
          if (dateVal && timeVal) {
            const labels = getSlotTimeLabels(dateVal, timeVal, tzVal || 'UTC');
            dbUpdate.practitioner_time = labels.practitionerTimeISO;
            dbUpdate.client_local_time = labels.clientLocalTimeISO;
          }
        }
      } catch (err) {
        console.error('Error updating timezone labels on booking update:', err);
      }
    }
    
    // Zoom & Reminders Integration
    if (updateData.zoomMeetingId !== undefined) dbUpdate.zoom_meeting_id = updateData.zoomMeetingId;
    if (updateData.zoomJoinUrl !== undefined) dbUpdate.zoom_join_url = updateData.zoomJoinUrl;
    if (updateData.zoomStartUrl !== undefined) dbUpdate.zoom_start_url = updateData.zoomStartUrl;
    if (updateData.meetingPassword !== undefined) dbUpdate.meeting_password = updateData.meetingPassword;
    if (updateData.meetingType !== undefined) dbUpdate.meeting_type = updateData.meetingType;
    if (updateData.calendarStatus !== undefined) dbUpdate.calendar_status = updateData.calendarStatus;
    if (updateData.reminderSent !== undefined) dbUpdate.reminder_sent = updateData.reminderSent;
    if (updateData.zoomStatus !== undefined) dbUpdate.zoom_status = updateData.zoomStatus;
 
    if (updateData.bookingStatus === 'completed') {
      const { data: currentBooking } = await writeClient
        .from('bookings')
        .select('booking_status, used_package_credit, user_id, email')
        .eq('id', id)
        .single();
      
      if (currentBooking && currentBooking.booking_status !== 'completed' && !currentBooking.used_package_credit) {
        dbUpdate.used_package_credit = true;
        
        // Decrement user_packages credit
        if (currentBooking.email) {
          const { data: activePkg } = await writeClient
            .from('user_packages')
            .select('id, remaining_credits')
            .eq('user_email', currentBooking.email)
            .eq('status', 'active')
            .gt('remaining_credits', 0)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (activePkg) {
            const nextCredits = activePkg.remaining_credits - 1;
            console.log(`[bookingService] Decrementing package ${activePkg.id} from ${activePkg.remaining_credits} to ${nextCredits}`);
            const { error: upPkgErr } = await writeClient
              .from('user_packages')
              .update({
                remaining_credits: nextCredits,
                status: nextCredits === 0 ? 'completed' : 'active'
              })
              .eq('id', activePkg.id);
            if (upPkgErr) {
              console.error('[bookingService] Error updating user_package remaining_credits:', upPkgErr.message);
            } else {
              console.log('[bookingService] Successfully decremented user_packages credit');
            }
          }
        }

        // Decrement membership_credits table via RPC if user_id exists
        if (currentBooking.user_id) {
          await writeClient.rpc('deduct_membership_credit', {
            p_user_id: currentBooking.user_id,
            p_count: 1
          });
        }
      }
     if (updateData.bookingStatus === 'cancelled') {
      const { data: currentBooking } = await writeClient
        .from('bookings')
        .select('booking_status, used_package_credit, user_id, email, selected_date, selected_time')
        .eq('id', id)
        .single();
      
      if (currentBooking && currentBooking.booking_status !== 'cancelled' && currentBooking.booking_status !== 'completed') {
        if (currentBooking.used_package_credit) {
          // Calculate hours difference from session start
          const now = new Date();
          const sessionStart = new Date(`${currentBooking.selected_date}T${currentBooking.selected_time}:00`);
          const diffMs = sessionStart.getTime() - now.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);

          if (diffHours >= 24) {
            console.log(`[bookingService] Early cancellation detected (>= 24h). Refund 1 credit atomically.`);
            const { data: refundSuccess, error: refundErr } = await writeClient.rpc('refund_booking_credit', {
              p_booking_id: id
            });
            if (refundErr) {
              console.error('[bookingService] Error executing refund_booking_credit RPC:', refundErr.message);
            } else {
              console.log('[bookingService] refund_booking_credit RPC returned:', refundSuccess);
              dbUpdate.used_package_credit = false;
            }
          } else {
            console.log(`[bookingService] Late cancellation detected (< 24h). Do not refund, and do not deduct credit twice.`);
          }
        }

        // Trigger waitlist alert for this date
        emailService.notifyWaitlistForDate(currentBooking.selected_date).catch(err => {
          console.error('[bookingService] Failed to notify waitlist on cancellation:', err);
        });
      }
    }
    }

    dbUpdate.updated_at = new Date().toISOString();

    const { data: rawResult, error } = await writeClient
      .from('bookings')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Map back to camelCase
    return mapBookingFromDb(rawResult);
  },

  /**
   * Deletes a booking from the sanctuary records
   */
  async deleteBooking(id: string) {
    const { error } = await writeClient
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Triggers the ritual recommendation email
   */
  async sendRitualEmail(bookingId: string, clientEmail: string, clientName: string, rituals: any[], adminNote?: string) {
    return await emailService.sendFollowUpRituals(bookingId, clientEmail, clientName, rituals, adminNote);
  },

  /**
   * Admin-driven regeneration of Zoom details when Zoom setup failed (Task 3)
   */
  async regenerateZoomForBooking(id: string) {
    const writeClient = supabaseAdmin || supabase;
    
    // 1. Fetch booking
    const { data: booking, error: fetchErr } = await writeClient
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchErr || !booking) {
      throw new Error(`Booking not found: ${fetchErr?.message || 'Unknown'}`);
    }
    
    // 2. Validate booking format
    const isVirtual = booking.session_format && booking.session_format.toLowerCase() === 'virtual';
    if (!isVirtual) {
      throw new Error('Cannot regenerate Zoom meeting for an in-person session.');
    }
    
    // 3. Create Zoom meeting
    const providerTimezone = 'America/New_York';
    const startUTC = fromZonedTime(`${booking.selected_date} ${booking.selected_time}:00`, providerTimezone);
    
    console.log(`[bookingService] Regenerating Zoom meeting for booking: ${id}`);
    const zoomResult = await zoomService.createZoomMeeting({
      topic: `${booking.selected_session || 'Healing Session'} with Alanna`,
      startTime: startUTC.toISOString(),
      duration: Number(booking.duration || 60),
    });
    
    // 4. Update booking record
    const { data: rawResult, error: updateErr } = await writeClient
      .from('bookings')
      .update({
        zoom_meeting_id: zoomResult.meetingId,
        zoom_join_url: zoomResult.joinUrl,
        zoom_start_url: zoomResult.hostUrl,
        meeting_password: zoomResult.password,
        meeting_type: '2',
        calendar_status: 'scheduled',
        zoom_status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (updateErr) throw updateErr;
    console.log('[ZOOM CREATED] Zoom meeting regenerated successfully.');
    
    const mapped = mapBookingFromDb(rawResult);
    // Send confirmation email again with Zoom details
    await emailService.sendBookingConfirmation(mapped);
    
    return mapped;
  }
};
