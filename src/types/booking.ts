export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  bookingReference: string;
  
  // Ritual Details
  emotion: string;
  recommendedPath: string;
  selectedSession: string; // The ritual name
  sessionFormat: 'Virtual' | 'In-Person' | 'Group';
  duration: number; // minutes
  
  // Scheduling
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:mm in EST
  timezone: string; // User's local timezone
  
  // User Info
  fullName: string;
  email: string;
  intentions: string;
  
  // Metadata
  bookingStatus: BookingStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface AvailabilitySlot {
  timeEST: string; // HH:mm
  timeLocal: string; // HH:mm translated to user timezone
  isAvailable: boolean;
  reason?: string;
}
