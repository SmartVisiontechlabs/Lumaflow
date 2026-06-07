import { supabase, supabaseAdmin } from '../config/supabase';
import { getAvailableSlots, getLocalTimeForEST, PROVIDER_TIMEZONE } from '../utils/bookingUtils';
import { formatInTimeZone } from 'date-fns-tz';

export const availabilityService = {
  /**
   * Generates real availability by filtering out existing bookings
   */
  async getAvailability(date: string, duration: number, timezone?: string) {
    console.log('\n--- BACKEND DEBUG: GET AVAILABILITY ---');
    console.log('Selected Date:', date);
    console.log('Selected Duration:', duration);
    console.log('Server Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Fetch bookings + blocked slots + availability settings
    const [bookingsResponse, blockedResponse, settingsResponse] = await Promise.all([
      supabase
        .from('bookings')
        .select('*')
        .eq('selected_date', date)
        .neq('booking_status', 'cancelled'),

      supabase
        .from('blocked_slots')
        .select('*')
        .eq('blocked_date', date),

      supabase
        .from('availability_settings')
        .select('*')
    ]);

    if (bookingsResponse.error) {
      console.error('[BOOKING FILTER] Error fetching bookings:', bookingsResponse.error.message || bookingsResponse.error);
      throw bookingsResponse.error;
    }
    if (blockedResponse.error) {
      console.warn('[BLOCKED SLOTS] Blocked Slots Fetch Error:', blockedResponse.error.message || blockedResponse.error);
    }
    if (settingsResponse.error) {
      console.warn('[AVAILABILITY SETTINGS] Fetch Error (using fallbacks):', settingsResponse.error.message || settingsResponse.error);
    }

    const rawBookings = bookingsResponse.data || [];
    const blockedSlots = blockedResponse.data || [];
    
    // Schema-compatible filtering: check both is_active and is_available, default to true if not explicitly false
    const rawSettings = settingsResponse.data || [];
    const scheduleSettings = rawSettings.filter((s: any) => {
      const active = s.is_active !== undefined ? s.is_active : s.is_available;
      return active !== false;
    });

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
      timezone,
      scheduleSettings
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
  },

  /**
   * Updates availability settings schedule (Admin, service-role bypass RLS recursion)
   */
  async updateAvailabilitySettings(payload: any[]) {
    const client = supabaseAdmin || supabase;

    // 1. Fetch all existing settings rows
    const { data: existingRows, error: fetchError } = await client
      .from('availability_settings')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching settings for update:', fetchError.message || fetchError);
      throw fetchError;
    }

    // 2. Identify duplicates for same day_of_week and keep only one row per day
    const rowsByDay: Record<number, any[]> = {};
    for (const row of existingRows || []) {
      const day = row.day_of_week;
      if (!rowsByDay[day]) {
        rowsByDay[day] = [];
      }
      rowsByDay[day].push(row);
    }

    const idsToDelete: string[] = [];
    const keptRows: Record<number, any> = {};

    for (const dayStr in rowsByDay) {
      const day = parseInt(dayStr, 10);
      const rows = rowsByDay[day];
      // Keep the first row, mark all others for deletion
      keptRows[day] = rows[0];
      if (rows.length > 1) {
        for (let i = 1; i < rows.length; i++) {
          idsToDelete.push(rows[i].id);
        }
      }
    }

    if (idsToDelete.length > 0) {
      console.log(`🧹 [Availability Service] Cleaning up duplicate settings rows. Deleting ids: ${idsToDelete.join(', ')}`);
      const { error: deleteError } = await client
        .from('availability_settings')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('❌ [Availability Service] Failed to clean up duplicate settings rows:', deleteError.message || deleteError);
      }
    }

    // 3. For each day in the payload, update the corresponding record or insert a new one
    const results = [];
    for (const item of payload) {
      const day = item.day_of_week;
      const existingRow = keptRows[day];

      const updateData: any = {};
      for (const key of ['start_time', 'end_time', 'buffer_minutes', 'is_active', 'is_available', 'timezone']) {
        if (item[key] !== undefined) {
          updateData[key] = item[key];
        }
      }
      updateData.updated_at = new Date().toISOString();

      if (existingRow) {
        // Update the existing record using its unique ID
        const { data: updated, error: updateError } = await client
          .from('availability_settings')
          .update(updateData)
          .eq('id', existingRow.id)
          .select();

        if (updateError) {
          console.error(`❌ [Availability Service] Failed to update day ${day}:`, updateError.message || updateError);
          throw updateError;
        }
        if (updated && updated.length > 0) {
          results.push(updated[0]);
        }
      } else {
        // Insert new record
        const insertData = {
          ...updateData,
          day_of_week: day
        };
        const { data: inserted, error: insertError } = await client
          .from('availability_settings')
          .insert(insertData)
          .select();

        if (insertError) {
          console.error(`❌ [Availability Service] Failed to insert day ${day}:`, insertError.message || insertError);
          throw insertError;
        }
        if (inserted && inserted.length > 0) {
          results.push(inserted[0]);
        }
      }
    }

    console.log(`✅ [Availability Service] Successfully updated ${results.length} availability settings rows.`);
    return results;
  },

  /**
   * Deletes all stale entries in blocked_slots where blocked_date is in the past (in practitioner EST timezone).
   */
  async prunePastBlockedSlots() {
    try {
      const todayString = formatInTimeZone(new Date(), PROVIDER_TIMEZONE, 'yyyy-MM-dd');
      console.log(`🧹 [Availability Service] Pruning past blocked slots before: ${todayString}`);
      
      const client = supabaseAdmin || supabase;
      const { data, error, count } = await client
        .from('blocked_slots')
        .delete({ count: 'exact' })
        .lt('blocked_date', todayString);

      if (error) {
        console.error('❌ [Availability Service] Pruning failed:', error.message || error);
        return { success: false, error };
      }

      console.log(`✅ [Availability Service] Pruned ${count ?? 0} stale blocked slots successfully.`);
      return { success: true, count: count ?? 0 };
    } catch (err: any) {
      console.error('❌ [Availability Service] Unexpected pruning error:', err.message || err);
      return { success: false, error: err };
    }
  },

  /**
   * Automatically initializes availability schedule settings for all 7 days of the week if missing.
   */
  async seedAvailabilitySettings() {
    try {
      console.log('🌱 [Availability Service] Checking availability settings seed status...');
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('availability_settings')
        .select('*');

      if (error) {
        console.error('❌ [Availability Service] Failed to fetch settings for seed:', error.message || error);
        return;
      }

      const existingDays = new Set((data || []).map((s: any) => s.day_of_week));
      const missingDays = [];

      for (let i = 0; i < 7; i++) {
        if (!existingDays.has(i)) {
          let start = '09:00:00';
          let end = '17:00:00';
          let is_active = false;

          if (i === 1) { // Mon
            start = '09:00:00';
            end = '13:00:00';
            is_active = true;
          } else if (i === 3) { // Wed
            start = '11:00:00';
            end = '16:00:00';
            is_active = true;
          } else if (i === 5) { // Fri
            start = '08:00:00';
            end = '12:00:00';
            is_active = true;
          }

          missingDays.push({
            day_of_week: i,
            start_time: start,
            end_time: end,
            is_active: is_active,
            buffer_minutes: 30
          });
        }
      }

      if (missingDays.length > 0) {
        console.log(`🌱 [Availability Service] Seeding ${missingDays.length} missing weekly schedule days...`);
        const { error: insertError } = await client
          .from('availability_settings')
          .insert(missingDays);

        if (insertError) {
          console.error('❌ [Availability Service] Failed to insert seed settings:', insertError.message || insertError);
        } else {
          console.log('✅ [Availability Service] Seeding completed successfully.');
        }
      } else {
        console.log('✅ [Availability Service] All 7 schedule days are already initialized.');
      }
    } catch (err: any) {
      console.error('❌ [Availability Service] Unexpected seeding error:', err.message || err);
    }
  }
};
