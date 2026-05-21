import { useBookingStore } from '../store/bookingStore';
import { getHealingRecommendation } from '../lib/healingRecommendations';
import { followUpMap, EmotionalState } from '../data/recommendationMap';

export const useBookingFlow = () => {
  const store = useBookingStore();

  const visibleSteps = store.entrySource === 'offering'
    ? [2, 3, 4, 5, 6, 7, 8]
    : store.entrySource === 'pricing'
    ? [1, 2, 3, 5, 6, 7, 8]
    : [1, 2, 3, 4, 5, 6, 7, 8];

  const totalSteps = visibleSteps.length + 1; // plus 1 for step 9 (confirmation)
  const activeIndex = visibleSteps.indexOf(store.currentStep);
  const progressPercentage = activeIndex !== -1
    ? ((activeIndex + 1) / visibleSteps.length) * 100
    : 100;

  const canContinue = () => {
    switch (store.currentStep) {
      case 1: return !!store.journeyType;
      case 2: return !!store.emotionalState;
      case 3: return !!store.selectedRitual;
      case 4: return !!store.selectedPackage;
      case 5: return !!store.sessionFormat;
      case 6: return !!store.selectedDuration;
      case 7: return !!store.selectedDate;
      case 8: return !!store.selectedTime;
      case 9: return !!store.fullName && !!store.email;
      default: return true;
    }
  };

  const updateRecommendation = (journey: string, emotion: string, pkg: any) => {
    if (!journey || !emotion) return;
    
    let recommendation: any = null;
    
    if (store.recommendationMatrix && store.recommendationMatrix.length > 0) {
      const normalizedJourney = journey.toLowerCase().trim();
      const normalizedFeeling = emotion.toLowerCase().trim();
      
      const matched = store.recommendationMatrix.find(entry => 
        entry.journey_type.toLowerCase().trim() === normalizedJourney &&
        entry.feeling.toLowerCase().trim() === normalizedFeeling
      );
      
      if (matched) {
        recommendation = {
          ritual: matched.recommended_ritual,
          focus: matched.focus,
          duration: matched.duration_minutes,
          insight: matched.explanation,
          quote: matched.quote,
          confidence: matched.confidence,
          confidenceReason: matched.confidence_reason,
          altDurations: matched.alt_durations,
          archetype: matched.archetype
        };
      } else {
        const partialMatched = store.recommendationMatrix.find(entry => 
          (normalizedJourney.includes(entry.journey_type.toLowerCase().trim()) || 
           entry.journey_type.toLowerCase().trim().includes(normalizedJourney)) &&
          entry.feeling.toLowerCase().trim() === normalizedFeeling
        );
        if (partialMatched) {
          recommendation = {
            ritual: partialMatched.recommended_ritual,
            focus: partialMatched.focus,
            duration: partialMatched.duration_minutes,
            insight: partialMatched.explanation,
            quote: partialMatched.quote,
            confidence: partialMatched.confidence,
            confidenceReason: partialMatched.confidence_reason,
            altDurations: partialMatched.alt_durations,
            archetype: partialMatched.archetype
          };
        }
      }
    }
    
    if (!recommendation) {
      recommendation = getHealingRecommendation(journey, emotion);
    }
    
    if (recommendation) {
      let finalRitual = recommendation.ritual;
      let finalFocus = recommendation.focus;
      let finalInsight = recommendation.insight;

      // Dynamic Ritual Logic based on Package credits
      if (pkg && pkg.credits > 1) {
        const emotionKey = emotion.toLowerCase() as EmotionalState;
        const extraRituals = followUpMap[emotionKey] || followUpMap.neutral;
        const ritualsToInclude = extraRituals.slice(0, pkg.credits - 1).map(r => r.ritual);
        
        if (ritualsToInclude.length > 0) {
          finalRitual = `${recommendation.ritual} + ${ritualsToInclude.join(' + ')}`;
          finalFocus = `${recommendation.focus} & Deep Integration`;
          finalInsight = `A comprehensive ${pkg.credits}-part journey. ${recommendation.insight} We will then progress through: ${ritualsToInclude.join(', ')}.`;
        }
      }

      store.setSelectedRitual(
        finalRitual,
        finalFocus,
        recommendation.quote,
        finalInsight,
        recommendation.confidence,
        recommendation.confidenceReason,
        recommendation.archetype
      );
      store.setDuration(recommendation.duration);
      store.setRecommendedDuration(recommendation.duration);
    }
  };

  const nextStep = () => {
    if (canContinue() && store.currentStep < 9) {
      // Auto-load recommendation if moving from step 2 to 3
      if (store.currentStep === 2) {
        updateRecommendation(store.journeyType, store.emotionalState, store.selectedPackage);
      }
      
      let targetStep = store.currentStep + 1;
      
      // Skip logic: if entering from pricing, skip step 4 (Plan)
      if (store.entrySource === 'pricing' && targetStep === 4) {
        targetStep = 5;
      }
      
      store.goToStep(targetStep);
    }
  };

  const prevStep = () => {
    if (store.entrySource === 'offering' && store.currentStep === 2) {
      return;
    }
    
    let targetStep = store.currentStep - 1;
    
    // Skip logic: if entering from pricing, skip step 4 (Plan)
    if (store.entrySource === 'pricing' && targetStep === 4) {
      targetStep = 3;
    }
    
    store.goToStep(targetStep);
  };

  return {
    ...store,
    progressPercentage,
    canContinue: canContinue(),
    isFirstStep: store.entrySource === 'offering' ? store.currentStep === 2 : store.currentStep === 1,
    isLastStep: store.currentStep === 9,
    nextStep,
    prevStep,
    updateRecommendation
  };
};
