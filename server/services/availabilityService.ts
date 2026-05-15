import { supabase } from '../config/supabase';
import { getAvailableSlots, getLocalTimeForEST } from '../utils/bookingUtils';

export const availabilityService = {
  /**
   * Generates real availability by filtering out existing bookings
   */
  async getAvailability(date: string, duration: number) {
    console.log('\n--- BACKEND DEBUG: GET AVAILABILITY ---');
    console.log('Selected Date:', date);
    console.log('Selected Duration:', duration);
    console.log('Server Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Fetch bookings + blocked slots
    const [bookingsResponse, blockedResponse] = await Promise.all([
      supabase
        .from('bookings')
        .select('*')
        .eq('selected_date', date)
        .neq('booking_status', 'cancelled'),

      supabase
        .from('blocked_slots')
        .select('*')
        .eq('blocked_date', date)
    ]);

    if (bookingsResponse.error) throw bookingsResponse.error;
    if (blockedResponse.error) {
      console.warn('Blocked Slots Fetch Error:', blockedResponse.error);
    }

    const rawBookings = bookingsResponse.data || [];
    const blockedSlots = blockedResponse.data || [];

    console.log('Blocked Slots:', blockedSlots);

    // FULL DAY BLOCK CHECK
    const isFullDayBlocked = blockedSlots.some((b: any) => {
      const bt = (b.blocked_time || '').toLowerCase().trim();

      return (
        !bt ||
        bt.includes('11:59') ||
        bt.includes('23:59') ||
        bt.includes('full') ||
        bt.includes('entire') ||
        bt.includes('whole')
      );
    });

    if (isFullDayBlocked) {
      console.log(`⚠️ FULL DAY BLOCKED: ${date}`);
      return [];
    }

    // Map DB → app format
    const existingBookings = rawBookings.map((b: any) => ({
      ...b,
      bookingReference: b.booking_reference,
      selectedDate: b.selected_date,
      selectedTime: b.selected_time,
      bookingStatus: b.booking_status,
      fullName: b.full_name,
      selectedSession: b.selected_session,
      sessionFormat: b.session_format,
      createdAt: b.created_at,
      updatedAt: b.updated_at
    }));

    console.log('Booked Slots:', existingBookings.length);

    // Generate slots using core engine (handles overlaps and blocks)
    const generatedSlots = getAvailableSlots(
      date,
      duration,
      existingBookings,
      blockedSlots
    );

    console.log(
      'Final Available Slots:',
      generatedSlots.filter((s: any) => s.isAvailable).length
    );

    console.log('--- END BACKEND DEBUG ---\n');

    return generatedSlots;
  },

  /**
   * Blocks a specific date or time range
   */
  async blockSlot(data: any) {
    const { data: result, error } = await supabase
      .from('blocked_slots')
      .insert({
        blocked_date: data.date,
        blocked_time: data.time || null,
        reason: data.reason || 'Sanctuary maintenance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  /**
   * Unblocks a previously blocked slot
   */
  async unblockSlot(id: string) {
    const { error } = await supabase
      .from('blocked_slots')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Retrieves all blocked slots for a period
   */
  async getBlockedSlots(start: string, end: string) {
    const { data, error } = await supabase
      .from('blocked_slots')
      .select('*')
      .gte('blocked_date', start)
      .lte('blocked_date', end);

    if (error) throw error;
    return data;
  }
};
