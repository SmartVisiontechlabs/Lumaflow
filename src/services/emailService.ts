import { resend } from '../../server/config/resend';
import { supabase } from '../lib/supabase';
import { BookingConfirmationEmail } from '../emails/BookingConfirmation';
import { AdminNotificationEmail } from '../emails/AdminNotification';
import { Reminder24hEmail } from '../emails/Reminder24h';
import { Prep1hEmail } from '../emails/Prep1h';
import { Booking } from '../types/booking';
import { getLocalTimeForEST } from '../utils/bookingUtils';
import { format, parse } from 'date-fns';

const FROM_EMAIL =
  process.env.EMAIL_FROM || 'noreply@send.thelumaflow.com';

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || 'sahushyamsvtl@gmail.com';

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
    console.log(`--- EMAIL ATTEMPT: Confirmation for ${booking.bookingReference} ---`);
    try {
      const timeLocal = getLocalTimeForEST(booking.selectedDate, booking.selectedTime);
      const timeESTFormatted = format(parse(booking.selectedTime, 'HH:mm', new Date()), 'hh:mm a') + ' EST';

      // 1. Send to Client
      const clientResult = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: booking.email,
        subject: '✨ Your sanctuary has been reserved',
        react: BookingConfirmationEmail({
          fullName: booking.fullName,
          ritual: booking.selectedSession,
          date: format(parse(booking.selectedDate, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy'),
          timeEST: timeESTFormatted,
          timeLocal: timeLocal,
          duration: booking.duration,
          reference: booking.bookingReference,
          intentions: booking.intentions,
          sessionFormat: booking.sessionFormat || 'Virtual',
          zoomJoinUrl: booking.zoomJoinUrl,
          zoomMeetingId: booking.zoomMeetingId,
          meetingPassword: booking.meetingPassword,
        }),
      });

      if (clientResult.error) {
        console.error('Client Email Error:', clientResult.error);
        await this.logEmail(booking.id, 'confirmation_client', booking.email, 'failed', clientResult.error.message);
      } else {
        await this.logEmail(booking.id, 'confirmation_client', booking.email, 'sent');
      }

      // 2. Send to Admin
      const adminResult = await resend.emails.send({
        from: `LumaFlow <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: `New Ritual Journey: ${booking.fullName}`,
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
        }),
      });

      if (adminResult.error) {
        console.error('Admin Email Error:', adminResult.error);
        await this.logEmail(booking.id, 'confirmation_admin', ADMIN_EMAIL, 'failed', adminResult.error.message);
      } else {
        await this.logEmail(booking.id, 'confirmation_admin', ADMIN_EMAIL, 'sent');
      }

      return { clientResult, adminResult };
    } catch (error: any) {
      console.error('Critical Email Delivery Failure:', error);
      await this.logEmail(booking.id, 'confirmation_critical', booking.email, 'failed', error.message);
      throw error;
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
   * Sends 1-hour preparation guide email
   */
  async sendPrep1h(booking: Booking) {
    console.log(`--- EMAIL ATTEMPT: 1h Prep for ${booking.bookingReference} ---`);
    try {
      const timeLocal = getLocalTimeForEST(booking.selectedDate, booking.selectedTime);

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
