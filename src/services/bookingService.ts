import { Booking, BookingStatus } from '../types/booking';
import { generateBookingReference } from '../utils/bookingUtils';

const STORAGE_KEY = 'lumaflow_production_bookings';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * PRODUCTION BOOKING SERVICE
 * Connects to the Node.js backend
 */
export const bookingService = {
  /**
   * Persists a new booking (POST /api/bookings)
   */
  async createBooking(bookingData: Omit<Booking, 'id' | 'bookingReference' | 'bookingStatus' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to secure sanctuary.');
      }

      const booking = await response.json();
      
      // Still sync with local storage for recovery/resume features
      const localBookings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      localBookings.push(booking);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localBookings));

      return booking;
    } catch (error) {
      console.error('API Connection Error:', error);
      throw error;
    }
  },

  /**
   * Retrieves all bookings (Local fallback)
   */
  async getAllBookings(): Promise<Booking[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Fetches real availability from the backend
   */
  async getAvailability(date: string, duration: number): Promise<any[]> {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`${API_URL}/availability?date=${date}&duration=${duration}&timezone=${encodeURIComponent(tz)}`);
      if (!response.ok) throw new Error('Failed to fetch availability.');
      return await response.json();
    } catch (error) {
      console.error('Availability Fetch Error:', error);
      return [];
    }
  },

  /**
   * Checks for a specific booking by reference
   */
  async getBookingByReference(ref: string): Promise<Booking | undefined> {
    const bookings = await this.getAllBookings();
    return bookings.find(b => b.bookingReference === ref);
  }
};
