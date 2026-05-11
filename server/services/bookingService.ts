import { supabase } from '../config/supabase';
import { generateBookingReference } from '../../src/utils/bookingUtils';
import { emailService } from '../../src/services/emailService';

export const bookingService = {
  /**
   * Retrieves all bookings from Supabase
   */
  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Creates a new booking and triggers emails
   */
  async createBooking(bookingData: any) {
    const reference = generateBookingReference();
    
    // 1. Save to Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          ...bookingData,
          bookingReference: reference,
          bookingStatus: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database Insertion Error:', error);
      throw error;
    }

    // 2. Trigger transactional email sequence
    try {
      await emailService.sendBookingConfirmation(data);
    } catch (emailError) {
      console.error('Email Delivery Error (Booking persisted):', emailError);
    }

    return data;
  }
};
