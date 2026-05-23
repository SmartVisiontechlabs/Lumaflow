import { supabase } from '../config/supabase';
import { generateBookingReference } from '../utils/bookingUtils';
import { emailService } from './emailService';
import { zoomService } from './zoomService';
import { fromZonedTime } from 'date-fns-tz';

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
    return (rawData || []).map((b: any) => {
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
      };
    });
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

    const parsed = parseIntentions(data.intentions);
    return {
      data: {
        ...data,
        bookingReference: data.booking_reference,
        selectedDate: data.selected_date,
        selectedTime: data.selected_time,
        bookingStatus: data.booking_status,
        fullName: data.full_name,
        selectedSession: data.selected_session,
        sessionFormat: data.session_format,
        stripe_payment_id: data.stripe_payment_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        journeyType: parsed.journeyType,
        intentions: parsed.intentions,
        zoomMeetingId: data.zoom_meeting_id,
        zoomJoinUrl: data.zoom_join_url,
        zoomStartUrl: data.zoom_start_url,
        meetingPassword: data.meeting_password,
        meetingType: data.meeting_type,
        calendarStatus: data.calendar_status,
        reminderSent: data.reminder_sent,
        zoomStatus: data.zoom_status,
      },
      error: null
    };
  },

  /**
   * Creates a new booking and triggers emails
   */
  async createBooking(bookingData: any) {
    const reference = generateBookingReference();
    
    let intentionsEnveloped = bookingData.intentions || '';
    if (bookingData.journeyType) {
      intentionsEnveloped = `[Journey: ${bookingData.journeyType}] ${intentionsEnveloped}`;
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
    };

    console.log('[bookingService] Inserting base booking into Supabase...');
    const { data: rawResult, error } = await supabase
      .from('bookings')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Database Insertion Error:', error);
      throw error;
    }

    console.log('[BOOKING CREATED]');

    // Write booking history if user_id is set
    if (bookingData.userId) {
      console.log('[bookingService] Creating booking history record for user:', bookingData.userId);
      const { error: histError } = await supabase.rpc('log_booking_history', {
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
    const credits = bookingData.packageCredits ? Number(bookingData.packageCredits) : 1;
    if (bookingData.packageId && credits > 1) {
      console.log('[bookingService] Package purchased, provisioning credits:', bookingData.packageName);
      // Insert into user_packages
      const { error: upErr } = await supabase
        .from('user_packages')
        .insert({
          user_email: bookingData.email,
          package_id: bookingData.packageId,
          total_credits: credits,
          remaining_credits: credits,
          status: 'active'
        });
      if (upErr) {
        console.error('[bookingService] Error inserting user_package:', upErr);
      }

      // Update membership_credits using RPC
      if (bookingData.userId) {
        const { error: mcErr } = await supabase.rpc('create_or_update_membership_credits', {
          p_user_id: bookingData.userId,
          p_email: bookingData.email,
          p_total_credits: credits,
          p_remaining_credits: credits
        });
        if (mcErr) {
          console.error('[bookingService] Error updating membership_credits via RPC:', mcErr);
        }
      }
    }

    const isVirtual = bookingData.sessionFormat && bookingData.sessionFormat.toLowerCase() === 'virtual';

    if (isVirtual) {
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

      if (updateError) {
        console.error('Failed to update booking with Zoom details:', updateError);
        throw updateError;
      }

      // Update our local rawResult copy with new values
      Object.assign(rawResult, updatedResult);
      console.log('[ZOOM CREATED]');
    } else {
      console.log('[ZOOM CREATED]');
    }

    const parsedResult = parseIntentions(rawResult.intentions);
    // Map result back to camelCase
    const data = {
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
      journeyType: parsedResult.journeyType,
      intentions: parsedResult.intentions,
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

    // 2. Trigger transactional email sequence (this throws on failure to send client/admin emails)
    await emailService.sendBookingConfirmation(data);

    return data;
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
      const { data: currentBooking } = await supabase
        .from('bookings')
        .select('booking_status, used_package_credit, user_id, email')
        .eq('id', id)
        .single();
      
      if (currentBooking && currentBooking.booking_status !== 'completed' && !currentBooking.used_package_credit) {
        dbUpdate.used_package_credit = true;
        
        // Decrement user_packages credit
        if (currentBooking.email) {
          const { data: activePkg } = await supabase
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
            const { error: upPkgErr } = await supabase
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
          await supabase.rpc('deduct_membership_credit', {
            p_user_id: currentBooking.user_id,
            p_count: 1
          });
        }
      }
    }

    dbUpdate.updated_at = new Date().toISOString();

    const { data: rawResult, error } = await supabase
      .from('bookings')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Map back to camelCase
    return {
      ...rawResult,
      bookingReference: rawResult.booking_reference,
      selectedDate: rawResult.selected_date,
      selectedTime: rawResult.selected_time,
      bookingStatus: rawResult.booking_status,
      fullName: rawResult.full_name,
      selectedSession: rawResult.selected_session,
      sessionFormat: rawResult.session_format,
      createdAt: rawResult.created_at,
      updatedAt: rawResult.updated_at,
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
  },

  /**
   * Deletes a booking from the sanctuary records
   */
  async deleteBooking(id: string) {
    const { error } = await supabase
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
  }
};
