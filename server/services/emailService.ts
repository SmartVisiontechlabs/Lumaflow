import { resend } from '../config/resend';
import { supabase } from '../config/supabase';
import { BookingConfirmationEmail } from '../../src/emails/BookingConfirmation';
import { AdminNotificationEmail } from '../../src/emails/AdminNotification';
import { Reminder24hEmail } from '../../src/emails/Reminder24h';
import { Prep2hEmail } from '../../src/emails/Prep2h';
import { FollowUpRitualEmail } from '../../src/emails/FollowUpRitualEmail';
import { Booking } from '../types/booking';
import { getLocalTimeForEST } from '../utils/bookingUtils';
import { format, parse, addMinutes } from 'date-fns';
import {
  generateGoogleCalendarUrl,
} from '../utils/calendarUtils';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  'noreply@send.thelumaflow.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sahushyamsvtl@gmail.com';

export const emailService = {
  /**
   * Logs an email attempt to the database
   */
  async logEmail(bookingId: string | undefined, type: string, recipient: string, status: 'sent' | 'failed', error?: string) {
    try {
      if (!bookingId) return;
      await supabase.from('email_logs').insert({
        booking_id: bookingId,
        email_type: type,
        recipient: recipient,
        status: status,
        error_message: error,
        sent_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to persist email log:', logError);
    }
  },

  /**
   * Sends the initial booking confirmation to client and admin
   */
  async sendBookingConfirmation(booking: Booking) {
    console.log('--- EMAIL PIPELINE STARTED ---');
    console.log('RESEND API KEY EXISTS:', !!process.env.RESEND_API_KEY);
    console.log('SENDER:', `LumaFlow <${FROM_EMAIL}>`);
    console.log('BOOKING REFERENCE:', booking.bookingReference);

    const timeLocal = getLocalTimeForEST(booking.selectedDate, booking.selectedTime);
    const timeESTFormatted = format(parse(booking.selectedTime, 'HH:mm', new Date()), 'hh:mm a') + ' EST';


    // Calendar Integration Data
    const PROVIDER_TIMEZONE = 'America/New_York';
    const startUTC = fromZonedTime(`${booking.selectedDate} ${booking.selectedTime}:00`, PROVIDER_TIMEZONE);
    const endUTC = addMinutes(
      startUTC,
      Number(booking.duration || 60)
    );

    const calendarDates = `${formatInTimeZone(startUTC, 'UTC', "yyyyMMdd'T'HHmmss'Z'")}/${formatInTimeZone(endUTC, 'UTC', "yyyyMMdd'T'HHmmss'Z'")}`;
    const calendarTitle = encodeURIComponent('LumaFlow Healing Session');
    const calendarDetails = encodeURIComponent(`
Client: ${booking.fullName}
Ritual: ${booking.selectedSession}
Reference: ${booking.bookingReference}

Please arrive in a quiet space with water nearby and headphones if possible.
    `.trim());

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&dates=${calendarDates}&details=${calendarDetails}`;

    // Generate ICS content
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LumaFlow//Sanctuary//EN
BEGIN:VEVENT
UID:${booking.bookingReference}@thelumaflow.com
DTSTAMP:${formatInTimeZone(new Date(), 'UTC', "yyyyMMdd'T'HHmmss'Z'")}
DTSTART:${formatInTimeZone(startUTC, 'UTC', "yyyyMMdd'T'HHmmss'Z'")}
DTEND:${formatInTimeZone(endUTC, 'UTC', "yyyyMMdd'T'HHmmss'Z'")}
SUMMARY:LumaFlow Healing Session
DESCRIPTION:Client: ${booking.fullName}\\nRitual: ${booking.selectedSession}\\nReference: ${booking.bookingReference}\\n\\nPlease arrive in a quiet space with water nearby and headphones if possible.
END:VEVENT
END:VCALENDAR
    `.trim();

    const icsDataUri = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

    // 1. Send to USER
    try {
      console.log('SENDING USER EMAIL:', booking.email);
      const clientResult = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: booking.email,
        replyTo: 'support@thelumaflow.com',
        subject: 'Your LumaFlow Booking Confirmation',
        react: BookingConfirmationEmail({
          fullName: booking.fullName,
          ritual: booking.selectedSession,
          date: format(parse(booking.selectedDate, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy'),
          timeEST: timeESTFormatted,
          timeLocal: timeLocal,
          duration: booking.duration,
          reference: booking.bookingReference,
          intentions: booking.intentions,
          googleCalendarUrl,
          icsDataUri,
        }),
        text: `
Your Sanctuary Has Been Reserved

Hello ${booking.fullName},
Your ritual journey is now scheduled.

Ritual: ${booking.selectedSession}
Date: ${format(parse(booking.selectedDate, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy')}
Time: ${timeESTFormatted} (${timeLocal} Local)
Reference: ${booking.bookingReference}

Preparation:
- Quiet private space
- Water nearby
- Comfortable clothing
- Headphones recommended
- Arrive 5 minutes early

Add to Google Calendar: ${googleCalendarUrl}

If you need support, reply to this email.
        `.trim(),
      });

      if (clientResult.error) {
        console.error('USER EMAIL FAILED:', clientResult.error.message);
        await this.logEmail(booking.id, 'confirmation_client', booking.email, 'failed', clientResult.error.message);
      } else {
        console.log('USER EMAIL SUCCESS:', clientResult.data?.id);
        await this.logEmail(booking.id, 'confirmation_client', booking.email, 'sent');
      }
    } catch (userEmailError: any) {
      console.error('USER EMAIL FAILED (CRITICAL):', userEmailError.message);
    }

    // 2. Send to ADMIN
    try {
      console.log('SENDING ADMIN EMAIL:', ADMIN_EMAIL);
      const adminResult = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: `🌙 New Sanctuary Booking: ${booking.fullName}`,
        react: AdminNotificationEmail({
          fullName: booking.fullName,
          email: booking.email,
          emotion: booking.emotion,
          ritual: booking.selectedSession,
          duration: booking.duration,
          intentions: booking.intentions,
          date: booking.selectedDate,
          timeEST: timeESTFormatted,
          reference: booking.bookingReference,

          googleCalendarUrl,
          icsDataUri,
        }),
      });

      if (adminResult.error) {
        console.error('ADMIN EMAIL FAILED:', adminResult.error.message);
        await this.logEmail(booking.id, 'confirmation_admin', ADMIN_EMAIL, 'failed', adminResult.error.message);
      } else {
        console.log('ADMIN EMAIL SUCCESS:', adminResult.data?.id);
        await this.logEmail(booking.id, 'confirmation_admin', ADMIN_EMAIL, 'sent');
      }
    } catch (adminEmailError: any) {
      console.error('ADMIN EMAIL FAILED (CRITICAL):', adminEmailError.message);
    }

    console.log('--- EMAIL PIPELINE FINISHED ---');
  },

  /**
   * Sends Follow-Up Ritual recommendations to the client
   */
  async sendFollowUpRituals(bookingId: string, clientEmail: string, clientName: string, rituals: any[], adminNote?: string) {
    console.log('--- RITUAL EMAIL PIPELINE STARTED ---');
    console.log('CLIENT:', clientEmail);
    console.log('RITUALS COUNT:', rituals.length);

    try {
      const result = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: clientEmail,
        subject: '✨ The Journey Continues: Your Recommended Integration',
        react: FollowUpRitualEmail({
          clientName: clientName,
          rituals: rituals.map(r => ({
            ritual: r.ritual_name,
            focus: r.ritual_focus || 'Integration',
            duration: r.ritual_duration || 60,
            insight: r.ritual_description || '',
            quote: r.ritual_quote || 'The body knows the way.'
          })),
          adminNote: adminNote
        }),
      });

      if (result.error) {
        console.error('RITUAL EMAIL FAILED:', result.error.message);
        await this.logEmail(bookingId, 'follow_up_ritual', clientEmail, 'failed', result.error.message);
        return { success: false, error: result.error.message };
      } else {
        console.log('RITUAL EMAIL SUCCESS:', result.data?.id);
        await this.logEmail(bookingId, 'follow_up_ritual', clientEmail, 'sent');
        return { success: true, data: result.data };
      }
    } catch (error: any) {
      console.error('RITUAL EMAIL FAILED (CRITICAL):', error.message);
      await this.logEmail(bookingId, 'follow_up_ritual_critical', clientEmail, 'failed', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Sends 24-hour reminder anticipation email
   */
  async sendReminder24h(booking: Booking) {
    console.log(`--- EMAIL ATTEMPT: 24h Reminder for ${booking.bookingReference} ---`);
    try {
      const timeLocal = getLocalTimeForEST(booking.selectedDate, booking.selectedTime);
      const timeESTFormatted = format(parse(booking.selectedTime, 'HH:mm', new Date()), 'hh:mm a') + ' EST';

      const result = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: booking.email,
        subject: 'Your sanctuary awaits tomorrow ✨',
        react: Reminder24hEmail({
          fullName: booking.fullName,
          ritual: booking.selectedSession,
          date: format(parse(booking.selectedDate, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy'),
          timeEST: timeESTFormatted,
          timeLocal: timeLocal,
        }),
      });

      if (result.error) {
        await this.logEmail(booking.id, 'reminder_24h', booking.email, 'failed', result.error.message);
      } else {
        await this.logEmail(booking.id, 'reminder_24h', booking.email, 'sent');
      }
    } catch (error: any) {
      console.error('Error sending 24h reminder:', error);
      await this.logEmail(booking.id, 'reminder_24h_critical', booking.email, 'failed', error.message);
    }
  },

  /**
   * Sends 2-hour preparation guide email
   */
  async sendPrep2h(booking: Booking) {
    console.log(`--- EMAIL ATTEMPT: 2h Prep for ${booking.bookingReference} ---`);
    try {
      const timeLocal = getLocalTimeForEST(booking.selectedDate, booking.selectedTime);

      const result = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: booking.email,
        subject: 'A gentle preparation for your session',
        react: Prep2hEmail({
          fullName: booking.fullName,
          timeLocal: timeLocal,
        }),
      });

      if (result.error) {
        await this.logEmail(booking.id, 'prep_2h', booking.email, 'failed', result.error.message);
      } else {
        await this.logEmail(booking.id, 'prep_2h', booking.email, 'sent');
      }
    } catch (error: any) {
      console.error('Error sending 2h prep email:', error);
      await this.logEmail(booking.id, 'prep_2h_critical', booking.email, 'failed', error.message);
    }
  }
};
