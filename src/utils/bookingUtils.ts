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

/**
 * Generates available slots for a given date and duration
 * Respects working hours (8AM-4PM EST, Mon-Sat) and prevents overlaps
 */
export const getAvailableSlots = (
  dateStr: string, // YYYY-MM-DD
  duration: number,
  existingBookings: Booking[],
  blockedSlots: any[] = [],
  timezone?: string
): AvailabilitySlot[] => {
  const slots: AvailabilitySlot[] = [];
  const userTimezone = timezone || (typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');

  console.log('--- UTILS DEBUG: getAvailableSlots ---');
  console.log('[AVAILABILITY QUERY] Input Date:', dateStr);
  console.log('[AVAILABILITY QUERY] Input Duration:', duration);
  console.log('[TIMEZONE] Resolved User Timezone:', userTimezone);

  // 1. Check for Sunday using a timezone-safe UTC check
  const [year, month, day] = dateStr.split('-').map(Number);
  const refDate = new Date(Date.UTC(year, month - 1, day));
  if (refDate.getUTCDay() === 0) {
    console.log('[BOOKING FILTER] Sunday detected. No slots.');
    return [];
  }

  // 2. Pure numerical logic for 8:00 AM - 4:00 PM EST
  let currentHour = 8;
  let currentMinute = 0;

  while (currentHour < 16) {
    const timeEST = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Calculate end time numerically to avoid Date object shift issues
    const endTotalMinutes = (currentHour * 60) + currentMinute + duration;
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;

    // Check if slot exceeds 4:00 PM (16:00) EST
    if (endHour > 16 || (endHour === 16 && endMinute > 0)) {
      console.log(`Slot starting at ${timeEST} with duration ${duration} ends at ${endHour}:${endMinute.toString().padStart(2, '0')}. Exceeds 16:00 limit.`);
      break;
    }

    // 3. Conflict detection using UTC-normalized dates
    const slotStartUTC = fromZonedTime(`${dateStr} ${timeEST}:00`, PROVIDER_TIMEZONE);
    const slotEndUTC = addMinutes(slotStartUTC, duration);

    const conflictingBooking = existingBookings.find(booking => {
      if (booking.selectedDate !== dateStr || booking.bookingStatus === 'cancelled') return false;
      
      const bStartUTC = fromZonedTime(`${booking.selectedDate} ${booking.selectedTime}:00`, PROVIDER_TIMEZONE);
      const bEndUTC = addMinutes(bStartUTC, booking.duration);
      
      return rangesOverlap(slotStartUTC, slotEndUTC, bStartUTC, bEndUTC);
    });

    if (conflictingBooking) {
      console.log(`[BOOKING FILTER] Conflict detected for slot ${timeEST} on ${dateStr} with booking ref ${conflictingBooking.bookingReference}`);
    }
    const hasConflict = !!conflictingBooking;

    // 4. Check against manual blocked slots (e.g. sanctuary maintenance)
    const isManuallyBlocked = (blockedSlots || []).some(block => {
      // Full day block (no time specified or explicit 24h range)
      const bt = block.blocked_time;
      if (!bt || bt === '00:00-23:59' || bt === '00:00-11:59' || bt === '12:00 AM - 11:59 PM' || bt === '00:00') {
        console.log(`[BLOCKED SLOTS] Full-day block matching for ${dateStr}: ${block.reason || 'No reason'}`);
        return true;
      }

      // Parse "HH:mm-HH:mm" or "HH:mm"
      const [bStart, bEnd] = block.blocked_time.split('-');
      
      const blockStartUTC = fromZonedTime(`${dateStr} ${bStart}`, PROVIDER_TIMEZONE);
      // If no end time, assume 30 min block or end of day
      const blockEndUTC = bEnd 
        ? fromZonedTime(`${dateStr} ${bEnd}`, PROVIDER_TIMEZONE)
        : addMinutes(blockStartUTC, 30);
      
      const overlaps = rangesOverlap(slotStartUTC, slotEndUTC, blockStartUTC, blockEndUTC);
      if (overlaps) {
        console.log(`[BLOCKED SLOTS] Slot ${timeEST} overlaps with blocked slot ${block.blocked_time} (${block.reason || 'No reason'})`);
      }
      return overlaps;
    });

    slots.push({
      timeEST: timeEST,
      timeLocal: getLocalTimeForEST(dateStr, timeEST, userTimezone),
      isAvailable: !hasConflict && !isManuallyBlocked
    });

    // Advance 30 mins
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }

  console.log('[SLOTS GENERATED] Generated Slots Count:', slots.length);
  console.log('--- END UTILS DEBUG ---');

  return slots;
};
