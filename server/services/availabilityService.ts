import { supabase } from '../config/supabase';
import { getAvailableSlots, getLocalTimeForEST } from '../utils/bookingUtils';

export const availabilityService = {
  /**
   * Generates real availability by filtering out existing bookings
   */
  async getAvailability(date: string, duration: number, timezone?: string) {
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

    if (bookingsResponse.error) {
      console.error('[BOOKING FILTER] Error fetching bookings:', bookingsResponse.error.message || bookingsResponse.error);
      throw bookingsResponse.error;
    }
    if (blockedResponse.error) {
      console.warn('[BLOCKED SLOTS] Blocked Slots Fetch Error:', blockedResponse.error.message || blockedResponse.error);
    }

    const rawBookings = bookingsResponse.data || [];
    const blockedSlots = blockedResponse.data || [];

    console.log(`[BLOCKED SLOTS] Fetched blocked slots for ${date}:`, JSON.stringify(blockedSlots));

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
      console.log(`[BLOCKED SLOTS] Date is fully blocked: ${date}`);
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

    console.log(`[BOOKING FILTER] Existing bookings count for ${date}:`, existingBookings.length);

    // Generate slots using core engine (handles overlaps and blocks)
    const generatedSlots = getAvailableSlots(
      date,
      duration,
      existingBookings,
      blockedSlots,
      timezone
    );

    const availableCount = generatedSlots.filter((s: any) => s.isAvailable).length;
    console.log(`[SLOTS GENERATED] Generated ${generatedSlots.length} slots. Available slots count: ${availableCount}`);
    
    // Phase 5C Required Deep Logs
    console.log('[AVAILABILITY CHECK]');
    console.log('selectedDate:', date);
    console.log('timezone:', timezone);
    console.log('availableSlots:', generatedSlots.map((s: any) => s.timeEST));
    console.log('blockedSlots:', blockedSlots.map((b: any) => ({ time: b.blocked_time, reason: b.reason })));
    console.log('finalSlots:', generatedSlots.filter((s: any) => s.isAvailable).map((s: any) => s.timeEST));
    console.log('admin availability source: Database (blocked_slots table)');
    console.log('zoom calendar blocks: Evaluated from local bookings metadata (zoom_status)');
    console.log('recurring slot generation: 8:00 AM - 4:00 PM EST, 30 min intervals');
    console.log('booked slot conflicts:', existingBookings.map((b: any) => ({ ref: b.bookingReference, time: b.selectedTime, duration: b.duration })));
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
