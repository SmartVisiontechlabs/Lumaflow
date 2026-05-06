import { create } from 'zustand';

export type Emotion = 'Stressed' | 'Heavy' | 'Disconnected' | 'Seeking Clarity' | 'Emotionally Drained' | 'Anxious';

export interface Session {
  id: string;
  name: string;
  image: string;
  duration: string;
  benefit: string;
  description: string;
  recommendation: string;
}

export type SessionFormat = 'Virtual' | 'In-Person' | 'Group';
export type SessionDuration = '60 Minutes' | '90 Minutes' | '120 Minutes';

export interface BookingState {
  // Selection State
  selectedEmotion: Emotion | null;
  selectedSession: Session | null;
  selectedFormat: SessionFormat | null;
  selectedDuration: SessionDuration | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  userDetails: {
    name: string;
    email: string;
    intentions: string;
  };
  
  // Navigation State
  currentStep: number;
  isOpen: boolean;
  
  // Actions
  setEmotion: (emotion: Emotion) => void;
  setSession: (session: Session) => void;
  setFormat: (format: SessionFormat) => void;
  setDuration: (duration: SessionDuration) => void;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;
  setUserDetails: (details: Partial<BookingState['userDetails']>) => void;
  nextStep: () => void;
  prevStep: () => void;
  openBooking: () => void;
  closeBooking: () => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedEmotion: null,
  selectedSession: null,
  selectedFormat: null,
  selectedDuration: null,
  selectedDate: null,
  selectedTime: null,
  userDetails: {
    name: '',
    email: '',
    intentions: '',
  },
  currentStep: 1,
  isOpen: false,

  setEmotion: (emotion) => set({ selectedEmotion: emotion }),
  setSession: (session) => set({ selectedSession: session }),
  setFormat: (format) => set({ selectedFormat: format }),
  setDuration: (duration) => set({ selectedDuration: duration }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (time) => set({ selectedTime: time }),
  setUserDetails: (details) => 
    set((state) => ({ userDetails: { ...state.userDetails, ...details } })),
  
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
  openBooking: () => set({ isOpen: true }),
  closeBooking: () => set({ isOpen: false }),
  resetBooking: () => set({
    selectedEmotion: null,
    selectedSession: null,
    selectedFormat: null,
    selectedDuration: null,
    selectedDate: null,
    selectedTime: null,
    userDetails: { name: '', email: '', intentions: '' },
    currentStep: 1,
  }),
}));
