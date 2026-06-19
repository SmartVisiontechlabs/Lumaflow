import { supabase } from '../config/supabase';
import { emailService } from './emailService';
import { fromZonedTime } from 'date-fns-tz';
import { addHours, isBefore, subHours, subDays } from 'date-fns';
import { settingsService } from './settingsService';

const PROVIDER_TIMEZONE = 'America/New_York';

export const reminderScheduler = {
  /**
   * Polls the database for upcoming sessions and sends reminders
   */
  async checkAndSendReminders() {
    console.log('--- RUNNING REMINDER SCHEDULER ---');
    const now = new Date();

    const config = await settingsService.getCommunicationConfig().catch(() => ({
      bookingConfirmations: true,
      reminder24h: true,
      prep1h: true,
      adminNotifications: true
    }));

    if (!config.reminder24h && !config.prep1h) {
      console.log('[Scheduler] All scheduled reminders (24h and prep) are disabled in settings.');
      console.log('--- SCHEDULER FINISHED ---');
      return;
    }

    // 1. Fetch active, completed, and draft bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .in('booking_status', ['confirmed', 'completed', 'draft']);

    if (error) {
      console.error('Scheduler DB Error:', error);
      return;
    }

    console.log(`Checking ${bookings?.length || 0} active bookings for reminders...`);

    for (const rawBooking of (bookings || [])) {
      // Normalize to camelCase
      const booking = {
        ...rawBooking,
        bookingReference: rawBooking.booking_reference,
        selectedDate: rawBooking.selected_date,
        selectedTime: rawBooking.selected_time,
        bookingStatus: rawBooking.booking_status,
        fullName: rawBooking.full_name,
        selectedSession: rawBooking.selected_session,
        sessionFormat: rawBooking.session_format,
        createdAt: rawBooking.created_at,
        updatedAt: rawBooking.updated_at,
        zoomMeetingId: rawBooking.zoom_meeting_id,
        zoomJoinUrl: rawBooking.zoom_join_url,
        zoomStartUrl: rawBooking.zoom_start_url,
        meetingPassword: rawBooking.meeting_password,
        meetingType: rawBooking.meeting_type,
        calendarStatus: rawBooking.calendar_status,
        reminderSent: rawBooking.reminder_sent,
      };

      if (booking.bookingStatus === 'confirmed') {
        const sessionStartTime = fromZonedTime(`${booking.selectedDate} ${booking.selectedTime}:00`, PROVIDER_TIMEZONE);

        // --- 24-HOUR REMINDER CHECK ---
        const reminder24hThreshold = subDays(sessionStartTime, 1);
        if (config.reminder24h && isBefore(reminder24hThreshold, now) && isBefore(now, sessionStartTime)) {
          await this.triggerEmailIfMissing(booking, 'reminder_24h', () => emailService.sendReminder24h(booking));
        }

        // --- 1-HOUR PREP CHECK ---
        const prep1hThreshold = subHours(sessionStartTime, 1);
        if (config.prep1h && isBefore(prep1hThreshold, now) && isBefore(now, sessionStartTime)) {
          await this.triggerEmailIfMissing(booking, 'prep_1h', () => emailService.sendPrep1h(booking));

          // --- FUTURE WHATSAPP INTEGRATION PLACEHOLDER ---
          // TODO: Once the Twilio / WhatsApp Business API credentials are set up,
          // send an automated WhatsApp reminder to client with the join details.
          console.log(`[WhatsApp Reminder Pending] WhatsApp automation placeholder for ${booking.fullName} (${booking.bookingReference})`);
        }

        // --- MARK AS COMPLETED CHECK ---
        // If session ended more than 1 hour ago
        const completionThreshold = addHours(sessionStartTime, 2); // Assuming max duration is 120m
        if (isBefore(completionThreshold, now)) {
          await this.markAsCompleted(booking);
        }
      } else if (booking.bookingStatus === 'completed') {
        // --- POST SESSION FOLLOW-UP CHECK ---
        await this.triggerEmailIfMissing(booking, 'post_session_followup', () => emailService.sendPostSessionFollowUp(booking));
      } else if (booking.bookingStatus === 'draft') {
        // --- ABANDONED BOOKING RECOVERY CHECK ---
        if (booking.email && booking.fullName) {
          const draftAgeHours = (now.getTime() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60);
          if (draftAgeHours >= 24) {
            await this.triggerEmailIfMissing(booking, 'abandoned_recovery', () => emailService.sendAbandonedRecovery(booking));
          }
        }
      }
    }

    console.log('--- SCHEDULER FINISHED ---');
  },

  /**
   * Checks email_logs to see if this specific email was already sent
   */
  async triggerEmailIfMissing(booking: any, emailType: string, sendFn: () => Promise<any>) {
    const { data: logs, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('booking_id', booking.id)
      .eq('email_type', emailType);

    if (error) return;

    if (!logs || logs.length === 0) {
      console.log(`Sending ${emailType} to ${booking.email} for booking ${booking.bookingReference}`);
      try {
        await sendFn();
      } catch (err) {
        console.error(`Failed to send ${emailType}:`, err);
      }
    }
  },

  async markAsCompleted(booking: any) {
    if (booking.bookingStatus === 'completed') return;

    console.log(`Marking booking ${booking.bookingReference} as completed.`);
    await supabase
      .from('bookings')
      .update({ booking_status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', booking.id);
  }
};
