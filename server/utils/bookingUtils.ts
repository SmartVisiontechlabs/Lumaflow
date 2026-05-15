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
export const getLocalTimeForEST = (dateStr: string, timeStr: string) => {
  const userTimezone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
  
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
  blockedSlots: any[] = []
): AvailabilitySlot[] => {
  const slots: AvailabilitySlot[] = [];
  const userTimezone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

  console.log('--- UTILS DEBUG: getAvailableSlots ---');
  console.log('Input Date:', dateStr);
  console.log('Input Duration:', duration);
  console.log('System Timezone:', userTimezone);

  // 1. Check for Sunday
  const [year, month, day] = dateStr.split('-').map(Number);
  const refDate = new Date(year, month - 1, day);
  if (getDay(refDate) === 0) {
    console.log('Sunday detected. No slots.');
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

    const hasConflict = existingBookings.some(booking => {
      if (booking.selectedDate !== dateStr || booking.bookingStatus === 'cancelled') return false;
      
      const bStartUTC = fromZonedTime(`${booking.selectedDate} ${booking.selectedTime}:00`, PROVIDER_TIMEZONE);
      const bEndUTC = addMinutes(bStartUTC, booking.duration);
      
      return rangesOverlap(slotStartUTC, slotEndUTC, bStartUTC, bEndUTC);
    });

    // 4. Check against manual blocked slots (e.g. sanctuary maintenance)
    const isManuallyBlocked = (blockedSlots || []).some(block => {
      // Full day block (no time specified or explicit 24h range)
      const bt = block.blocked_time;
      if (!bt || bt === '00:00-23:59' || bt === '00:00-11:59' || bt === '12:00 AM - 11:59 PM' || bt === '00:00') return true;

      // Parse "HH:mm-HH:mm" or "HH:mm"
      const [bStart, bEnd] = block.blocked_time.split('-');
      
      const blockStartUTC = fromZonedTime(`${dateStr} ${bStart}`, PROVIDER_TIMEZONE);
      // If no end time, assume 30 min block or end of day
      const blockEndUTC = bEnd 
        ? fromZonedTime(`${dateStr} ${bEnd}`, PROVIDER_TIMEZONE)
        : addMinutes(blockStartUTC, 30);
      
      return rangesOverlap(slotStartUTC, slotEndUTC, blockStartUTC, blockEndUTC);
    });

    slots.push({
      timeEST: timeEST,
      timeLocal: getLocalTimeForEST(dateStr, timeEST),
      isAvailable: !hasConflict && !isManuallyBlocked
    });

    // Advance 30 mins
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }

  console.log('Generated Slots Count:', slots.length);
  console.log('--- END UTILS DEBUG ---');

  return slots;
};

/**
 * Formats a date for calendar services (YYYYMMDDTHHMMSSZ)
 */
export const formatCalendarDate = (date: Date) => {
  return formatInTimeZone(date, 'UTC', "yyyyMMdd'T'HHmmss'Z'");
};
