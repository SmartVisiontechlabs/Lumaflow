import { useBookingStore } from '../store/bookingStore';
import { recommendationMap, EmotionalState } from '../data/recommendationMap';

export const useBookingFlow = () => {
  const store = useBookingStore();

  const totalSteps = 8;
  const progressPercentage = (store.currentStep / totalSteps) * 100;

  const canContinue = () => {
    switch (store.currentStep) {
      case 1: return !!store.emotionalState;
      case 2: return !!store.selectedRitual;
      case 3: return !!store.sessionFormat;
      case 4: return !!store.selectedDuration;
      case 5: return !!store.selectedDate;
      case 6: return !!store.selectedTime;
      case 7: return !!store.fullName && !!store.email;
      default: return true;
    }
  };

  const nextStep = () => {
    if (canContinue() && store.currentStep < totalSteps) {
      // Auto-load recommendation if moving from step 1 to 2
      if (store.currentStep === 1) {
        const recommendation = recommendationMap[store.emotionalState.toLowerCase() as EmotionalState];
        if (recommendation) {
          store.setSelectedRitual(
            recommendation.ritual,
            recommendation.focus,
            recommendation.quote,
            recommendation.insight
          );
          store.setDuration(recommendation.duration);
        }
      }
      store.nextStep();
    }
  };

  const prevStep = () => {
    store.prevStep();
  };

  return {
    ...store,
    progressPercentage,
    canContinue: canContinue(),
    isFirstStep: store.currentStep === 1,
    isLastStep: store.currentStep === totalSteps,
    nextStep,
    prevStep,
  };
};
