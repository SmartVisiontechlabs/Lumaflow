import { resend } from '../config/resend';
import { supabase } from '../config/supabase';
import { settingsService } from './settingsService';
import { BookingConfirmationEmail } from '../../src/emails/BookingConfirmation';
import { AdminNotificationEmail } from '../../src/emails/AdminNotification';
import { Reminder24hEmail } from '../../src/emails/Reminder24h';
import { Prep1hEmail } from '../../src/emails/Prep1h';
import { FollowUpRitualEmail } from '../../src/emails/FollowUpRitualEmail';
import { WelcomeEmail } from '../../src/emails/WelcomeEmail';
import { AccessSanctuaryEmail } from '../../src/emails/AccessSanctuary';
import { PostSessionFollowUpEmail } from '../../src/emails/PostSessionFollowUp';
import { AbandonedBookingRecoveryEmail } from '../../src/emails/AbandonedBookingRecovery';
import { WaitlistAlertEmail } from '../../src/emails/WaitlistAlert';
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
    try {
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
            console.warn(`[emailService] Gracefully continuing after client email error: ${clientResult.error.message}`);
          } else {
            console.log('[EMAIL SENT]');
            await this.logEmail(booking.id, 'confirmation_client', booking.email, 'sent');
          }
        } catch (userEmailError: any) {
          console.error('USER EMAIL FAILED (CRITICAL):', userEmailError.message);
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
              timeLocal: timeLocal,
              googleCalendarUrl,
              icsDataUri,
              sessionFormat: booking.sessionFormat || 'Virtual',
              zoomJoinUrl: booking.zoomJoinUrl,
              zoomStartUrl: booking.zoomStartUrl,
              zoomMeetingId: booking.zoomMeetingId,
              meetingPassword: booking.meetingPassword,
            }),
          });

          if (adminResult.error) {
            console.error('ADMIN EMAIL FAILED:', adminResult.error.message);
            await this.logEmail(booking.id, 'confirmation_admin', ADMIN_EMAIL, 'failed', adminResult.error.message);
            console.warn(`[emailService] Gracefully continuing after admin email error: ${adminResult.error.message}`);
          } else {
            console.log('[ADMIN EMAIL SENT]');
            await this.logEmail(booking.id, 'confirmation_admin', ADMIN_EMAIL, 'sent');
          }
        } catch (adminEmailError: any) {
          console.error('ADMIN EMAIL FAILED (CRITICAL):', adminEmailError.message);
        }
      } else {
        console.log('Skipping admin booking confirmation email due to admin settings.');
      }

      console.log('--- EMAIL PIPELINE FINISHED ---');
    } catch (pipelineError: any) {
      console.error('❌ [emailService] CRITICAL PIPELINE EXCEPTION:', pipelineError.message || pipelineError);
    }
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
          sessionFormat: booking.sessionFormat || 'Virtual',
          zoomJoinUrl: booking.zoomJoinUrl,
          zoomMeetingId: booking.zoomMeetingId,
          meetingPassword: booking.meetingPassword,
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
   * Sends post session follow-up with reflection prompt and rebook link
   */
  async sendPostSessionFollowUp(booking: Booking) {
    console.log(`--- EMAIL ATTEMPT: Post Session Follow-Up for ${booking.bookingReference} ---`);
    try {
      const result = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: booking.email,
        subject: 'Gratitude for your somatic journey ✨',
        react: PostSessionFollowUpEmail({
          fullName: booking.fullName,
          ritual: booking.selectedSession,
          rebookUrl: 'https://thelumaflow.com/book',
        }),
      });

      if (result.error) {
        await this.logEmail(booking.id, 'post_session_followup', booking.email, 'failed', result.error.message);
      } else {
        await this.logEmail(booking.id, 'post_session_followup', booking.email, 'sent');
      }
    } catch (error: any) {
      console.error('Error sending post session follow-up:', error);
      await this.logEmail(booking.id, 'post_session_followup_critical', booking.email, 'failed', error.message);
    }
  },

  /**
   * Sends abandoned booking recovery email
   */
  async sendAbandonedRecovery(booking: Booking) {
    console.log(`--- EMAIL ATTEMPT: Abandoned Booking Recovery for ${booking.bookingReference} ---`);
    try {
      const timeESTFormatted = booking.selectedTime 
        ? (format(parse(booking.selectedTime, 'HH:mm', new Date()), 'hh:mm a') + ' EST')
        : null;
      const dateFormatted = booking.selectedDate
        ? format(parse(booking.selectedDate, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy')
        : null;

      const result = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: booking.email,
        subject: 'Your sanctuary reservation is waiting ✨',
        react: AbandonedBookingRecoveryEmail({
          fullName: booking.fullName,
          ritual: booking.selectedSession,
          date: dateFormatted,
          timeEST: timeESTFormatted,
          resumeUrl: 'https://thelumaflow.com/book',
        }),
      });

      if (result.error) {
        await this.logEmail(booking.id, 'abandoned_recovery', booking.email, 'failed', result.error.message);
      } else {
        await this.logEmail(booking.id, 'abandoned_recovery', booking.email, 'sent');
      }
    } catch (error: any) {
      console.error('Error sending abandoned recovery email:', error);
      await this.logEmail(booking.id, 'abandoned_recovery_critical', booking.email, 'failed', error.message);
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
  },

  /**
   * Sends the luxury welcome/onboarding email to new clients
   */
  async sendWelcomeEmail(email: string, fullName: string, magicLink: string, booking?: Booking) {
    try {
      console.log('--- WELCOME EMAIL PIPELINE STARTED ---');
      console.log('RECIPIENT:', email);
      
      const ritualName = booking?.selectedSession;
      const ritualDate = booking?.selectedDate ? format(parse(booking.selectedDate, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy') : undefined;
      const ritualTime = booking?.selectedTime ? (booking.practitionerTime || (format(parse(booking.selectedTime, 'HH:mm', new Date()), 'hh:mm a') + ' EST')) : undefined;
      const sessionLink = booking?.zoomJoinUrl;
      const sessionFormat = booking?.sessionFormat;

      const result = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: email,
        replyTo: 'support@thelumaflow.com',
        subject: 'Welcome to Lumaflow',
        react: WelcomeEmail({
          fullName,
          magicLink,
          email,
          ritualName,
          ritualDate,
          ritualTime,
          sessionLink,
          sessionFormat
        }),
      });

      if (result.error) {
        console.error('WELCOME EMAIL FAILED:', result.error.message);
        if (booking?.id) {
          await this.logEmail(booking.id, 'welcome_email', email, 'failed', result.error.message);
        }
      } else {
        console.log('[WELCOME EMAIL SENT]');
        if (booking?.id) {
          await this.logEmail(booking.id, 'welcome_email', email, 'sent');
        }
      }
    } catch (error: any) {
      console.error('WELCOME EMAIL PIPELINE EXCEPTION:', error.message);
    }
  },

  /**
   * Sends the passwordless magic login link to access the sanctuary
   */
  async sendMagicLinkEmail(email: string, fullName: string, magicLink: string) {
    try {
      console.log('--- MAGIC LINK EMAIL PIPELINE STARTED ---');
      console.log('RECIPIENT:', email);

      const result = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: email,
        replyTo: 'support@thelumaflow.com',
        subject: 'Access Your Sanctuary',
        react: AccessSanctuaryEmail({
          fullName,
          magicLink,
          email,
        }),
      });

      if (result.error) {
        console.error('MAGIC LINK EMAIL FAILED:', result.error.message);
      } else {
        console.log('[MAGIC LINK EMAIL SENT]');
      }
    } catch (error: any) {
      console.error('MAGIC LINK EMAIL PIPELINE EXCEPTION:', error.message);
    }
  },

  /**
   * Sends waitlist alert email to a client
   */
  async sendWaitlistAlert(recipientEmail: string, recipientName: string, date: string, timePreference: string) {
    try {
      console.log('--- WAITLIST EMAIL PIPELINE STARTED ---');
      console.log('RECIPIENT:', recipientEmail);

      const result = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: recipientEmail,
        replyTo: 'support@thelumaflow.com',
        subject: '✨ A Somatic Ritual Space Has Opened',
        react: WaitlistAlertEmail({
          fullName: recipientName,
          preferredDate: date,
          preferredTime: timePreference,
          bookUrl: 'https://thelumaflow.com/book',
        }),
      });

      if (result.error) {
        console.error('WAITLIST EMAIL FAILED:', result.error.message);
      } else {
        console.log('[WAITLIST EMAIL SENT]');
      }
    } catch (error: any) {
      console.error('WAITLIST EMAIL PIPELINE EXCEPTION:', error.message);
    }
  },

  /**
   * Notifies all waitlisted clients for a given date
   */
  async notifyWaitlistForDate(date: string, time?: string) {
    try {
      console.log(`[Waitlist Notification] Checking waitlist for date: ${date}`);
      // Query waitlist entries
      const { data: entries, error } = await supabase
        .from('waitlist_entries')
        .select('*')
        .eq('preferred_date', date)
        .eq('notified', false);

      if (error) {
        console.error('[Waitlist Notification] Error querying waitlist:', error);
        return;
      }

      if (!entries || entries.length === 0) {
        console.log(`[Waitlist Notification] No waitlist entries found for date: ${date}`);
        return;
      }

      console.log(`[Waitlist Notification] Found ${entries.length} waitlist entries to notify.`);

      for (const entry of entries) {
        const formattedDate = format(parse(date, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy');
        await this.sendWaitlistAlert(entry.email, entry.name, formattedDate, entry.preferred_time);
      }

      // Mark as notified
      const entryIds = entries.map(e => e.id);
      const { error: updateError } = await supabase
        .from('waitlist_entries')
        .update({ notified: true })
        .in('id', entryIds);

      if (updateError) {
        console.error('[Waitlist Notification] Error marking entries as notified:', updateError);
      } else {
        console.log(`[Waitlist Notification] Marked ${entries.length} entries as notified.`);
      }
    } catch (err: any) {
      console.error('[Waitlist Notification] Critical error notifying waitlist:', err);
    }
  }
};
