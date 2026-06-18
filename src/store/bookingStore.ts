import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cmsService } from '../services/cmsService';
import { RecommendationMatrixEntry } from '../types/cms';
import { trackBookSessionClick, trackBookingStarted } from '../lib/analytics';

export type PackageInfo = {
  id?: string;
  name: string;
  credits: number;
  price: number;
};

export type BookingState = {
  // Navigation State
  currentStep: number;
  isOpen: boolean;
  showResumePrompt: boolean;
  lastActivityTimestamp: number | null;
  entrySource: 'hero' | 'offering' | 'pricing';

  // Emotional State & Recommendation
  journeyType: string;
  emotionalState: string;
  selectedRitual: string;
  ritualFocus: string;
  recommendationQuote: string;
  recommendationInsight: string;
  confidence: string;        // e.g. 'Highly Aligned'
  confidenceReason: string;  // one-sentence explanation
  ritualArchetype: string;   // 'breathwork' | 'somatic' | 'meditation' | 'integration'

  // Session Preferences
  sessionFormat: string;
  selectedDuration: number;
  recommendedDuration: number;

  // Package Intent
  selectedPackage: PackageInfo | null;

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
  recommendationMatrix: RecommendationMatrixEntry[] | null;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetBooking: () => void;
  openBooking: (pkg?: PackageInfo | null, options?: { journeyType?: string; entrySource?: 'hero' | 'offering' | 'pricing' }) => void;
  closeBooking: () => void;
  setShowResumePrompt: (show: boolean) => void;
  setBookingReference: (ref: string) => void;
  setIsSubmitting: (status: boolean) => void;
  fetchRecommendationMatrix: () => Promise<void>;

  setJourneyType: (journeyType: string) => void;
  setEmotionalState: (state: string) => void;
  setSelectedRitual: (ritual: string, focusText?: string, quote?: string, insight?: string, confidence?: string, confidenceReason?: string, archetype?: string) => void;
  setSessionFormat: (format: string) => void;
  setDuration: (duration: number) => void;
  setRecommendedDuration: (duration: number) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setUserDetails: (details: { fullName?: string; email?: string; intentions?: string }) => void;
  setSelectedPackage: (pkg: PackageInfo | null) => void;
  resumeFromDraftBooking: (draft: any) => void;
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      isOpen: false,
      showResumePrompt: false,
      lastActivityTimestamp: null,
      entrySource: 'hero',
      journeyType: '',
      emotionalState: '',
      selectedRitual: '',
      ritualFocus: '',
      recommendationQuote: '',
      recommendationInsight: '',
      confidence: '',
      confidenceReason: '',
      ritualArchetype: '',
      sessionFormat: '',
      selectedDuration: 60,
      recommendedDuration: 60,
      selectedPackage: null,
      selectedDate: '',
      selectedTime: '',
      fullName: '',
      email: '',
      intentions: '',
      lastBookingReference: null,
      isSubmitting: false,
      recommendationMatrix: null,

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
        entrySource: 'hero',
        journeyType: '',
        emotionalState: '',
        selectedRitual: '',
        ritualFocus: '',
        recommendationQuote: '',
        recommendationInsight: '',
        confidence: '',
        confidenceReason: '',
        ritualArchetype: '',
        sessionFormat: '',
        selectedDuration: 60,
        recommendedDuration: 60,
        selectedPackage: null,
        selectedDate: '',
        selectedTime: '',
        fullName: '',
        email: '',
        intentions: '',
        lastBookingReference: null,
        isSubmitting: false,
      }),
      openBooking: (pkg, options) => {
        const state = get();
        const now = Date.now();
        const timeout = 15 * 60 * 1000; // 15 minutes

        // Ensure pkg is a valid PackageInfo and not a React Event
        const isValidPackage = pkg && typeof pkg === 'object' && 'price' in pkg && 'credits' in pkg;
        const validPkg = isValidPackage ? pkg : null;

        const journeyType = options?.journeyType || '';
        const entrySource = options?.entrySource || (validPkg ? 'pricing' : options?.journeyType ? 'offering' : 'hero');
        const startStep = entrySource === 'offering' ? 2 : 1;

        // Track GA4 Book Session Click and Booking Started
        trackBookSessionClick(entrySource);
        trackBookingStarted(validPkg?.name || 'Single Session', validPkg?.price || 45);

        // If a valid package is passed or journeyType is preselected, starting fresh is preferred:
        if (validPkg || journeyType) {
          set({
            isOpen: true,
            showResumePrompt: false,
            currentStep: startStep,
            entrySource,
            journeyType,
            emotionalState: '',
            selectedRitual: '',
            ritualFocus: '',
            recommendationQuote: '',
            recommendationInsight: '',
            confidence: '',
            confidenceReason: '',
            ritualArchetype: '',
            sessionFormat: '',
            selectedDuration: 60,
            recommendedDuration: 60,
            selectedPackage: validPkg as PackageInfo,
            selectedDate: '',
            selectedTime: '',
            fullName: '',
            email: '',
            intentions: '',
            lastActivityTimestamp: now,
            lastBookingReference: null,
            isSubmitting: false,
          });
          return;
        }

        if (state.currentStep > 1 && state.lastActivityTimestamp && (now - state.lastActivityTimestamp < timeout)) {
          // Valid session exists, show resume prompt
          set({ isOpen: true, showResumePrompt: true });
        } else {
          // No valid session or expired, start fresh
          set({
            isOpen: true,
            showResumePrompt: false,
            currentStep: startStep,
            entrySource,
            journeyType: '',
            emotionalState: '',
            selectedRitual: '',
            ritualFocus: '',
            recommendationQuote: '',
            recommendationInsight: '',
            confidence: '',
            confidenceReason: '',
            ritualArchetype: '',
            sessionFormat: '',
            selectedDuration: 60,
            recommendedDuration: 60,
            selectedPackage: null,
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

      setJourneyType: (journeyType) => set({
        journeyType,
        lastActivityTimestamp: Date.now()
      }),
      setEmotionalState: (state) => set({ 
        emotionalState: state,
        lastActivityTimestamp: Date.now()
      }),
      setSelectedRitual: (ritual, focusText = '', quote = '', insight = '', confidence = '', confidenceReason = '', archetype = '') => 
      set({ 
        selectedRitual: ritual, 
        ritualFocus: focusText, 
        recommendationQuote: quote,
        recommendationInsight: insight,
        confidence,
        confidenceReason,
        ritualArchetype: archetype,
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
      setRecommendedDuration: (duration) => set({
        recommendedDuration: duration,
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
      setSelectedPackage: (pkg) => set({ 
        selectedPackage: pkg,
        lastActivityTimestamp: Date.now()
      }),
      resumeFromDraftBooking: (draft) => {
        const journeyType = draft.journeyType || '';
        const emotionalState = draft.emotion || '';
        const selectedRitual = draft.selectedSession || draft.selected_session || '';
        const sessionFormat = draft.sessionFormat || draft.session_format || '';
        const selectedDuration = draft.duration || 60;
        const recommendedDuration = draft.duration || 60;
        const selectedPackage = (draft.packageId || draft.package_id) ? {
          id: draft.packageId || draft.package_id,
          name: draft.packageName || draft.package_name,
          credits: draft.packageCredits || draft.package_credits || 1,
          price: draft.packagePrice || draft.package_price || 0
        } : null;
        const selectedDate = draft.selectedDate || draft.selected_date || '';
        const selectedTime = draft.selectedTime || draft.selected_time || '';
        const fullName = draft.fullName || draft.full_name || '';
        const email = draft.email || '';
        const intentions = draft.intentions || '';

        set({
          journeyType,
          emotionalState,
          selectedRitual,
          sessionFormat,
          selectedDuration,
          recommendedDuration,
          selectedPackage,
          selectedDate,
          selectedTime,
          fullName,
          email,
          intentions,
          showResumePrompt: true,
          lastActivityTimestamp: Date.now()
        });
      },
      fetchRecommendationMatrix: async () => {
        try {
          const matrix = await cmsService.getRecommendationMatrix();
          const mappedMatrix = matrix.map(m => ({
            id: m.id,
            journey_type: m.journey,
            feeling: m.feeling,
            recommended_ritual: m.recommended_ritual,
            focus: m.focus,
            duration_minutes: m.duration,
            explanation: m.recommended_plan,
            quote: '',
            confidence: m.confidence_score,
            confidence_reason: 'Deeply matched with your organic somatic rhythm.',
            alt_durations: [m.duration],
            archetype: 'Seeker',
            is_active: m.is_active
          }));
          set({ recommendationMatrix: mappedMatrix as any });
        } catch (e) {
          console.error('Failed to fetch recommendation matrix:', e);
        }
      },
    }),
    {
      name: 'lumaflow-booking-storage',
      partialize: (state) => {
        const { isOpen, showResumePrompt, recommendationMatrix, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);
