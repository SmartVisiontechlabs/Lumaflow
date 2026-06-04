import { adminSupabase as supabase } from '../lib/supabase';

export const adminService = {
  /**
   * Saves follow-up rituals to the database
   */
  async sendFollowUpRituals(rituals: any[]) {
    try {
      const { data, error } = await supabase
        .from('follow_up_rituals')
        .insert(rituals);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving follow-up rituals:', error);
      throw error;
    }
  },

  /**
   * Fetches follow-up rituals for a specific booking
   */
  async getFollowUpRituals(bookingId: string) {
    try {
      const { data, error } = await supabase
        .from('follow_up_rituals')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching follow-up rituals:', error);
      return [];
    }
  }
};
