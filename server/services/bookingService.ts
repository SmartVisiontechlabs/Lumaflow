import { supabase } from '../config/supabase';
import { generateBookingReference } from '../utils/bookingUtils';
import { emailService } from './emailService';

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
    return (rawData || []).map((b: any) => ({
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
      updatedAt: b.updated_at
    }));
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
        updatedAt: data.updated_at
      },
      error: null
    };
  },

  /**
   * Creates a new booking and triggers emails
   */
  async createBooking(bookingData: any) {
    const reference = generateBookingReference();
    
    // Map camelCase frontend data to snake_case for DB
    const dbData = {
      booking_reference: reference,
      full_name: bookingData.fullName,
      email: bookingData.email,
      intentions: bookingData.intentions,
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
      payment_status: 'paid',
      stripe_payment_status: 'paid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Save to Supabase
    const { data: rawResult, error } = await supabase
      .from('bookings')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Database Insertion Error:', error);
      throw error;
    }

    console.log('BOOKING CREATED:', reference);

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
      createdAt: rawResult.created_at,
      updatedAt: rawResult.updated_at
    };

    // 2. Trigger transactional email sequence
    try {
      await emailService.sendBookingConfirmation(data);
    } catch (emailError) {
      console.error('Email Delivery Error (Booking persisted):', emailError);
    }

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
      updatedAt: rawResult.updated_at
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
