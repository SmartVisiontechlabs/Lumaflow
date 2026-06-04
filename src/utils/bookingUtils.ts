import { format, addMinutes, isBefore, isAfter, getDay } from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { Booking, AvailabilitySlot } from '../types/booking';

export const PROVIDER_TIMEZONE = 'America/New_York'; // EST/EDT

/**
 * Generates a unique booking reference in the format LUMA-YYYY-XXXXX
 */
export const generateBookingReference = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `LUMA-${year}-${random}`;
};

/**
 * Checks if two time ranges overlap
 */
const rangesOverlap = (start1: Date, end1: Date, start2: Date, end2: Date) => {
  return isBefore(start1, end2) && isAfter(end1, start2);
};

/**
 * Formats a time string in EST for display
 */
export const formatESTTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return format(date, 'hh:mm a') + ' EST';
};

/**
 * Gets user's local time for an EST slot
 */
export const getLocalTimeForEST = (dateStr: string, timeStr: string, timezone?: string) => {
  const userTimezone = timezone || (typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
  
  // Create a UTC date from the EST time string
  const utcDate = fromZonedTime(`${dateStr} ${timeStr}:00`, PROVIDER_TIMEZONE);
  
  // Format that UTC date in the user's local timezone
  return formatInTimeZone(utcDate, userTimezone, 'hh:mm a');
};

export const getSlotTimeLabels = (dateStr: string, timeStr: string, clientTimezone: string) => {
  const nycDateTimeStr = `${dateStr}T${timeStr.substring(0, 5)}:00`;
  const utcDate = fromZonedTime(nycDateTimeStr, PROVIDER_TIMEZONE);
  const nycLabel = formatInTimeZone(utcDate, PROVIDER_TIMEZONE, 'hh:mm a zzz');
  const localLabel = formatInTimeZone(utcDate, clientTimezone, 'hh:mm a zzz');
  
  // Timestamps formatted as ISO 8601 with timezone offsets (fully compatible with PostgreSQL timestamptz)
  const practitionerTimeISO = formatInTimeZone(utcDate, PROVIDER_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
  const clientLocalTimeISO = formatInTimeZone(utcDate, clientTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX");

  return { nycLabel, localLabel, utcDate, practitionerTimeISO, clientLocalTimeISO };
};

export interface ScheduleDay {
  day_of_week: number;
  start_time: string;
  end_time: string;
  buffer_minutes: number;
  is_active?: boolean;
}

/**
 * Generates available slots for a given date and duration
 */
export const getAvailableSlots = (
  dateStr: string, // YYYY-MM-DD
  duration: number,
  existingBookings: Booking[],
  blockedSlots: any[] = [],
  timezone?: string,
  scheduleSettings?: ScheduleDay[]
): AvailabilitySlot[] => {
  const slots: AvailabilitySlot[] = [];
  const userTimezone = timezone || (typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');

  console.log('--- UTILS DEBUG: getAvailableSlots ---');
  console.log('[AVAILABILITY QUERY] Input Date:', dateStr);
  console.log('[AVAILABILITY QUERY] Input Duration:', duration);
  console.log('[TIMEZONE] Resolved User Timezone:', userTimezone);

  // 1. Get Day of Week (0 = Sunday, 6 = Saturday)
  const [year, month, day] = dateStr.split('-').map(Number);
  const refDate = new Date(year, month - 1, day);
  const dayOfWeek = refDate.getDay();

  // 2. Resolve availability schedule for this day of week
  const activeDay = (scheduleSettings || []).find(s => s.day_of_week === dayOfWeek);
  
  let startTime = '08:00';
  let endTime = '16:00';
  let bufferMinutes = 30;

  if (activeDay) {
    startTime = activeDay.start_time.substring(0, 5); // HH:mm
    endTime = activeDay.end_time.substring(0, 5); // HH:mm
    bufferMinutes = activeDay.buffer_minutes;
  } else {
    // Fallback default schedule: Monday (1): 9:00 - 13:00, Wednesday (3): 11:00 - 16:00, Friday (5): 08:00 - 12:00
    // Other days are closed by default (return empty) if no active settings are stored
    const defaults: Record<number, { start: string; end: string; buffer: number }> = {
      1: { start: '09:00', end: '13:00', buffer: 30 },
      3: { start: '11:00', end: '16:00', buffer: 30 },
      5: { start: '08:00', end: '12:00', buffer: 30 }
    };
    
    const defaultDay = defaults[dayOfWeek];
    if (!defaultDay) {
      console.log(`[BOOKING FILTER] Day ${dayOfWeek} is not active in default schedule. No slots.`);
      return [];
    }
    startTime = defaultDay.start;
    endTime = defaultDay.end;
    bufferMinutes = defaultDay.buffer;
  }

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;

  console.log(`[SCHEDULE] Active Day of Week: ${dayOfWeek}, Hours: ${startTime} - ${endTime}, Buffer: ${bufferMinutes}m`);

  // 3. Dynamic sequential slot generation
  while (currentTotalMinutes + duration <= endTotalMinutes) {
    const slotStartHour = Math.floor(currentTotalMinutes / 60);
    const slotStartMin = currentTotalMinutes % 60;
    const timeEST = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMin.toString().padStart(2, '0')}`;
    
    const slotStartUTC = fromZonedTime(`${dateStr} ${timeEST}:00`, PROVIDER_TIMEZONE);
    const slotEndUTC = addMinutes(slotStartUTC, duration);

    // Conflict detection using UTC-normalized dates + booking buffer
    const conflictingBooking = existingBookings.find(booking => {
      if (booking.selectedDate !== dateStr || booking.bookingStatus === 'cancelled') return false;
      
      const bStartUTC = fromZonedTime(`${booking.selectedDate} ${booking.selectedTime}:00`, PROVIDER_TIMEZONE);
      // Extend existing booking by its buffer time to prevent overlaps
      const bEndUTC = addMinutes(bStartUTC, booking.duration + bufferMinutes);
      
      // Proposed slot extended with its buffer: proposed_start -> proposed_start + duration + buffer
      const proposedEndWithBuffer = addMinutes(slotStartUTC, duration + bufferMinutes);
      
      return rangesOverlap(slotStartUTC, proposedEndWithBuffer, bStartUTC, bEndUTC);
    });

    if (conflictingBooking) {
      console.log(`[BOOKING FILTER] Conflict detected for slot ${timeEST} on ${dateStr} with booking ref ${conflictingBooking.bookingReference}`);
    }
    const hasConflict = !!conflictingBooking;

    // Check against manual blocked slots
    const isManuallyBlocked = (blockedSlots || []).some(block => {
      const bt = block.blocked_time;
      if (!bt || bt === '00:00-23:59' || bt === '00:00-11:59' || bt === '12:00 AM - 11:59 PM' || bt === '00:00') {
        return true;
      }

      const [bStart, bEnd] = block.blocked_time.split('-');
      const blockStartUTC = fromZonedTime(`${dateStr} ${bStart}`, PROVIDER_TIMEZONE);
      const blockEndUTC = bEnd 
        ? fromZonedTime(`${dateStr} ${bEnd}`, PROVIDER_TIMEZONE)
        : addMinutes(blockStartUTC, 30);
      
      return rangesOverlap(slotStartUTC, slotEndUTC, blockStartUTC, blockEndUTC);
    });

    const { nycLabel, localLabel } = getSlotTimeLabels(dateStr, timeEST, userTimezone);

    slots.push({
      timeEST: timeEST,
      timeLocal: localLabel, // Show BOTH formatted local label (e.g. 05:30 PM IST)
      timeESTLabel: nycLabel, // E.g. "08:00 AM EDT"
      timeLocalLabel: localLabel, // E.g. "05:30 PM IST"
      isAvailable: !hasConflict && !isManuallyBlocked
    });

    // Advance sequentially by duration + bufferMinutes
    currentTotalMinutes += duration + bufferMinutes;
  }

  console.log('[SLOTS GENERATED] Generated Slots Count:', slots.length);
  console.log('--- END UTILS DEBUG ---');

  return slots;
};
