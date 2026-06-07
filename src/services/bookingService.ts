import { Booking, BookingStatus } from '../types/booking';
import { generateBookingReference } from '../utils/bookingUtils';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'lumaflow_production_bookings';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * PRODUCTION BOOKING SERVICE
 * Connects to the Node.js backend
 */
export const bookingService = {
  /**
   * Checks if an email account exists in the database
   */
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    try {
      const response = await fetch(`${API_URL}/bookings/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to verify account status');
      return await response.json();
    } catch (error) {
      console.error('[bookingService] checkEmail error:', error);
      throw error;
    }
  },

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
   * Creates a draft booking (POST /api/bookings/draft)
   */
  async createDraftBooking(bookingData: any): Promise<Booking> {
    try {
      const response = await fetch(`${API_URL}/bookings/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking draft.');
      }

      return await response.json();
    } catch (error) {
      console.error('[bookingService] createDraftBooking error:', error);
      throw error;
    }
  },

  /**
   * Confirms a credit booking (POST /api/bookings/confirm-credit)
   */
  async confirmCreditBooking(bookingId: string, userId?: string): Promise<Booking> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/bookings/confirm-credit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bookingId, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm sanctuary credits.');
      }

      return await response.json();
    } catch (error) {
      console.error('[bookingService] confirmCreditBooking error:', error);
      throw error;
    }
  },

  /**
   * Gets any active draft booking (GET /api/bookings/active-draft)
   */
  async getActiveDraftBooking(userId: string): Promise<Booking | null> {
    try {
      const headers = await getAuthHeaders();
      // Exclude application/json from header to prevent potential CORS issues on GET
      const authHeaders = { ...headers } as any;
      delete authHeaders['Content-Type'];
      
      const response = await fetch(`${API_URL}/bookings/active-draft?userId=${userId}`, {
        headers: authHeaders
      });
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('[bookingService] getActiveDraftBooking error:', error);
      return null;
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
