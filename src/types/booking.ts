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

  // Zoom & Reminders Integration
  zoom_meeting_id?: string | null;
  zoom_join_url?: string | null;
  zoom_start_url?: string | null;
  meeting_password?: string | null;
  meeting_type?: string | null;
  calendar_status?: string | null;
  reminder_sent?: boolean | null;

  zoomMeetingId?: string | null;
  zoomJoinUrl?: string | null;
  zoomStartUrl?: string | null;
  meetingPassword?: string | null;
  meetingType?: string | null;
  calendarStatus?: string | null;
  reminderSent?: boolean | null;
  zoom_status?: string | null;
  zoomStatus?: string | null;
}

export interface AvailabilitySlot {
  timeEST: string; // HH:mm
  timeLocal: string; // HH:mm translated to user timezone
  isAvailable: boolean;
  reason?: string;
}
