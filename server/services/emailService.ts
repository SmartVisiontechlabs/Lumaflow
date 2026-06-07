import { resend } from '../config/resend';
import { supabase } from '../config/supabase';
import { settingsService } from './settingsService';
import { BookingConfirmationEmail } from '../../src/emails/BookingConfirmation';
import { AdminNotificationEmail } from '../../src/emails/AdminNotification';
import { Reminder24hEmail } from '../../src/emails/Reminder24h';
import { Prep1hEmail } from '../../src/emails/Prep1h';
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

    const config = await settingsService.getCommunicationConfig().catch(() => ({
      bookingConfirmations: true,
      reminder24h: true,
      prep1h: true,
      adminNotifications: true
    }));

    const timeESTFormatted = booking.practitionerTime || (format(parse(booking.selectedTime, 'HH:mm', new Date()), 'hh:mm a') + ' EST');
    const timeLocal = booking.clientLocalTime || getLocalTimeForEST(booking.selectedDate, booking.selectedTime, booking.timezone);


    // Calendar Integration Data
    const PROVIDER_TIMEZONE = 'America/New_York';
    const startUTC = fromZonedTime(`${booking.selectedDate} ${booking.selectedTime}:00`, PROVIDER_TIMEZONE);
    const endUTC = addMinutes(
      startUTC,
      Number(booking.duration || 60)
    );

    const calendarDates = `${formatInTimeZone(startUTC, 'UTC', "yyyyMMdd'T'HHmmss'Z'")}/${formatInTimeZone(endUTC, 'UTC', "yyyyMMdd'T'HHmmss'Z'")}`;
    const calendarTitle = encodeURIComponent('LumaFlow Healing Session');
    
    const isVirtual = booking.sessionFormat?.toLowerCase() === 'virtual';
    const locationStr = isVirtual 
      ? (booking.zoomJoinUrl || 'Zoom link details to be sent')
      : 'LumaFlow Sanctuary, Soho, Manhattan, NY';

    const rawDetails = isVirtual ? `
Client: ${booking.fullName}
Ritual: ${booking.selectedSession}
Reference: ${booking.bookingReference}

Zoom Join Link: ${booking.zoomJoinUrl || 'Provisioning details will be sent shortly'}
Meeting ID: ${booking.zoomMeetingId || 'N/A'}
Password: ${booking.meetingPassword || 'N/A'}

Preparation Checklist:
- Find a quiet, private space
- Water/herbal tea nearby
- Comfortable, loose clothing
- High-quality headphones recommended
- Test your internet and camera setup
`.trim() : `
Client: ${booking.fullName}
Ritual: ${booking.selectedSession}
Reference: ${booking.bookingReference}

Location: LumaFlow Sanctuary • Soho, Manhattan, NY

Preparation Checklist:
- Wear loose-fitting clothing
- Arrive 10 minutes early to settle in
- Refrain from heavy meals 2h prior
- Press the LumaFlow buzzer at the entrance
`.trim();

    const calendarDetails = encodeURIComponent(rawDetails);
    const calendarLocation = encodeURIComponent(locationStr);

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&dates=${calendarDates}&details=${calendarDetails}&location=${calendarLocation}`;

    // Generate ICS content
    const icsDescription = rawDetails.replace(/\n/g, '\\n');
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
LOCATION:${locationStr}
DESCRIPTION:${icsDescription}
END:VEVENT
END:VCALENDAR
    `.trim();

    const icsDataUri = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

    // 1. Send to USER (only if enabled)
    if (config.bookingConfirmations) {
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
            sessionFormat: booking.sessionFormat || 'Virtual',
            zoomJoinUrl: booking.zoomJoinUrl,
            zoomMeetingId: booking.zoomMeetingId,
            meetingPassword: booking.meetingPassword,
          }),
          text: `
Your Sanctuary Has Been Reserved

Hello ${booking.fullName},
Your ritual journey is now scheduled.

Ritual: ${booking.selectedSession}
Date: ${format(parse(booking.selectedDate, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy')}
Time: ${timeESTFormatted} (${timeLocal} Local)
Format: ${booking.sessionFormat}
Reference: ${booking.bookingReference}

${booking.sessionFormat?.toLowerCase() === 'virtual' ? `
Access Details:
Zoom Join Link: ${booking.zoomJoinUrl || 'Provisioning details will be sent shortly'}
Meeting ID: ${booking.zoomMeetingId || 'N/A'}
Password: ${booking.meetingPassword || 'N/A'}

Preparation Checklist:
- Find a quiet, private space
- Water/herbal tea nearby
- Comfortable, loose clothing
- High-quality headphones recommended
- Test your internet and camera setup
` : `
Location Details:
LumaFlow Sanctuary • Soho, Manhattan, NY

Preparation Checklist:
- Wear loose-fitting clothing
- Arrive 10 minutes early to settle in
- Refrain from heavy meals 2h prior
- Press the LumaFlow buzzer at the entrance
`}

Add to Google Calendar: ${googleCalendarUrl}

If you need support, reply to this email.
          `.trim(),
        });

        if (clientResult.error) {
          console.error('USER EMAIL FAILED:', clientResult.error.message);
          await this.logEmail(booking.id, 'confirmation_client', booking.email, 'failed', clientResult.error.message);
          throw new Error(`Client email failed: ${clientResult.error.message}`);
        } else {
          console.log('[EMAIL SENT]');
          await this.logEmail(booking.id, 'confirmation_client', booking.email, 'sent');
        }
      } catch (userEmailError: any) {
        console.error('USER EMAIL FAILED (CRITICAL):', userEmailError.message);
        throw userEmailError;
      }
    } else {
      console.log('Skipping client booking confirmation email due to admin settings.');
    }

    // 2. Send to ADMIN (only if enabled)
    if (config.adminNotifications) {
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
          throw new Error(`Admin email failed: ${adminResult.error.message}`);
        } else {
          console.log('[ADMIN EMAIL SENT]');
          await this.logEmail(booking.id, 'confirmation_admin', ADMIN_EMAIL, 'sent');
        }
      } catch (adminEmailError: any) {
        console.error('ADMIN EMAIL FAILED (CRITICAL):', adminEmailError.message);
        throw adminEmailError;
      }
    } else {
      console.log('Skipping admin booking confirmation email due to admin settings.');
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
      const timeESTFormatted = booking.practitionerTime || (format(parse(booking.selectedTime, 'HH:mm', new Date()), 'hh:mm a') + ' EST');
      const timeLocal = booking.clientLocalTime || getLocalTimeForEST(booking.selectedDate, booking.selectedTime, booking.timezone);

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
   * Sends 1-hour preparation guide email
   */
  async sendPrep1h(booking: Booking) {
    console.log(`--- EMAIL ATTEMPT: 1h Prep for ${booking.bookingReference} ---`);
    try {
      const timeLocal = booking.clientLocalTime || getLocalTimeForEST(booking.selectedDate, booking.selectedTime, booking.timezone);

      const result = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: booking.email,
        subject: 'Your sanctuary ritual begins in 1 hour ✨',
        react: Prep1hEmail({
          fullName: booking.fullName,
          ritual: booking.selectedSession,
          timeLocal: timeLocal,
          sessionFormat: booking.sessionFormat || 'Virtual',
          zoomJoinUrl: booking.zoomJoinUrl,
          zoomMeetingId: booking.zoomMeetingId,
          meetingPassword: booking.meetingPassword,
        }),
        text: `
Soft Arrival

Hello ${booking.fullName},
The time for your ritual journey, ${booking.selectedSession}, is nearing. Your session begins in 1 hour (at ${timeLocal}).

We invite you to begin your soft arrival now: disengage from screens, hydrate, and settle your breathing.

${booking.sessionFormat?.toLowerCase() === 'virtual' ? `
Virtual Sanctuary Credentials:
Zoom Link: ${booking.zoomJoinUrl || 'N/A'}
Meeting ID: ${booking.zoomMeetingId || 'N/A'}
Password: ${booking.meetingPassword || 'N/A'}
` : `
Sanctuary Location:
LumaFlow Sanctuary • Soho, Manhattan, NY
`}

We await you in the stillness.
        `.trim(),
      });

      if (result.error) {
        await this.logEmail(booking.id, 'prep_1h', booking.email, 'failed', result.error.message);
      } else {
        await this.logEmail(booking.id, 'prep_1h', booking.email, 'sent');
      }
    } catch (error: any) {
      console.error('Error sending 1h prep email:', error);
      await this.logEmail(booking.id, 'prep_1h_critical', booking.email, 'failed', error.message);
    }
  }
};
