import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BookingState = {
  // Navigation State
  currentStep: number;
  isOpen: boolean;
  showResumePrompt: boolean;
  lastActivityTimestamp: number | null;

  // Emotional State & Recommendation
  emotionalState: string;
  selectedRitual: string;
  ritualFocus: string;
  recommendationQuote: string;
  recommendationInsight: string;

  // Session Preferences
  sessionFormat: string;
  selectedDuration: number;

  // Scheduling
  selectedDate: string;
  selectedTime: string;

  // User Details
  fullName: string;
  email: string;
  intentions: string;

  // Production Engine State
  lastBookingReference: string | null;
  isSubmitting: boolean;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetBooking: () => void;
  openBooking: () => void;
  closeBooking: () => void;
  setShowResumePrompt: (show: boolean) => void;
  setBookingReference: (ref: string) => void;
  setIsSubmitting: (status: boolean) => void;

  setEmotionalState: (state: string) => void;
  setSelectedRitual: (ritual: string, focusText?: string, quote?: string, insight?: string) => void;
  setSessionFormat: (format: string) => void;
  setDuration: (duration: number) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setUserDetails: (details: { fullName?: string; email?: string; intentions?: string }) => void;
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      isOpen: false,
      showResumePrompt: false,
      lastActivityTimestamp: null,
      emotionalState: '',
      selectedRitual: '',
      ritualFocus: '',
      recommendationQuote: '',
      recommendationInsight: '',
      sessionFormat: '',
      selectedDuration: 60,
      selectedDate: '',
      selectedTime: '',
      fullName: '',
      email: '',
      intentions: '',
      lastBookingReference: null,
      isSubmitting: false,

      // Actions
      nextStep: () => set((state) => ({ 
        currentStep: state.currentStep + 1,
        lastActivityTimestamp: Date.now()
      })),
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(1, state.currentStep - 1),
        lastActivityTimestamp: Date.now()
      })),
      goToStep: (step) => set({ 
        currentStep: step,
        lastActivityTimestamp: Date.now()
      }),
      setShowResumePrompt: (show) => set({ showResumePrompt: show }),
      setBookingReference: (ref) => set({ lastBookingReference: ref }),
      setIsSubmitting: (status) => set({ isSubmitting: status }),
      resetBooking: () => set({
        currentStep: 1,
        showResumePrompt: false,
        lastActivityTimestamp: null,
        emotionalState: '',
        selectedRitual: '',
        ritualFocus: '',
        recommendationQuote: '',
        recommendationInsight: '',
        sessionFormat: '',
        selectedDuration: 60,
        selectedDate: '',
        selectedTime: '',
        fullName: '',
        email: '',
        intentions: '',
        lastBookingReference: null,
        isSubmitting: false,
      }),
      openBooking: () => {
        const state = get();
        const now = Date.now();
        const timeout = 15 * 60 * 1000; // 15 minutes

        if (state.currentStep > 1 && state.lastActivityTimestamp && (now - state.lastActivityTimestamp < timeout)) {
          // Valid session exists, show resume prompt
          set({ isOpen: true, showResumePrompt: true });
        } else {
          // No valid session or expired, start fresh
          set({
            isOpen: true,
            showResumePrompt: false,
            currentStep: 1,
            emotionalState: '',
            selectedRitual: '',
            ritualFocus: '',
            recommendationQuote: '',
            recommendationInsight: '',
            sessionFormat: '',
            selectedDuration: 60,
            selectedDate: '',
            selectedTime: '',
            fullName: '',
            email: '',
            intentions: '',
            lastActivityTimestamp: now,
            lastBookingReference: null,
            isSubmitting: false,
          });
        }
      },
      closeBooking: () => {
        set({ isOpen: false, showResumePrompt: false });
      },

      setEmotionalState: (state) => set({ 
        emotionalState: state,
        lastActivityTimestamp: Date.now()
      }),
      setSelectedRitual: (ritual, focusText = '', quote = '', insight = '') => 
        set({ 
          selectedRitual: ritual, 
          ritualFocus: focusText, 
          recommendationQuote: quote,
          recommendationInsight: insight,
          lastActivityTimestamp: Date.now()
        }),
      setSessionFormat: (format) => set({ 
        sessionFormat: format,
        lastActivityTimestamp: Date.now()
      }),
      setDuration: (duration) => set({ 
        selectedDuration: duration,
        lastActivityTimestamp: Date.now()
      }),
      setDate: (date) => set({ 
        selectedDate: date,
        lastActivityTimestamp: Date.now()
      }),
      setTime: (time) => set({ 
        selectedTime: time,
        lastActivityTimestamp: Date.now()
      }),
      setUserDetails: (details) => set((state) => ({ 
        ...state, 
        ...details,
        lastActivityTimestamp: Date.now()
      })),
    }),
    {
      name: 'lumaflow-booking-storage',
      partialize: (state) => {
        const { isOpen, showResumePrompt, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);
