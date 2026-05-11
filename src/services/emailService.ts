import { resend } from '../lib/resend';
import { BookingConfirmationEmail } from '../emails/BookingConfirmation';
import { AdminNotificationEmail } from '../emails/AdminNotification';
import { Booking } from '../types/booking';
import { getLocalTimeForEST } from '../utils/bookingUtils';
import { format, parse } from 'date-fns';

const FROM_EMAIL = 'Lumaflow Sanctuary <rituals@lumaflow.com>'; // Update with verified domain
const ADMIN_EMAIL = 'admin@lumaflow.com'; // Update with admin recipient

export const emailService = {
  /**
   * Sends the initial booking confirmation to client and admin
   */
  async sendBookingConfirmation(booking: Booking) {
    try {
      const timeLocal = getLocalTimeForEST(booking.selectedDate, booking.selectedTime);
      const timeESTFormatted = format(parse(booking.selectedTime, 'HH:mm', new Date()), 'hh:mm a') + ' EST';

      // 1. Send to Client
      const clientEmail = await resend.emails.send({
        from: FROM_EMAIL,
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
        }),
      });

      // 2. Send to Admin
      const adminEmail = await resend.emails.send({
        from: FROM_EMAIL,
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

      return { clientEmail, adminEmail };
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
      throw error;
    }
  },

  /**
   * Placeholder for reminder logic (to be triggered by scheduler)
   */
  async sendReminder24h(booking: Booking) {
    // Logic for 24h reminder
  },

  async sendPrep2h(booking: Booking) {
    // Logic for 2h preparation guide
  }
};
