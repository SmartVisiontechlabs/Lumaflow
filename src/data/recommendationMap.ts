export type EmotionalState = 
  | 'stressed' 
  | 'heavy' 
  | 'disconnected' 
  | 'anxious' 
  | 'emotionally drained' 
  | 'seeking clarity';

export interface Recommendation {
  ritual: string;
  focus: string;
  duration: number;
  insight: string;
  quote: string;
}

export const recommendationMap: Record<EmotionalState, Recommendation> = {
  stressed: {
    ritual: 'The Nervous System Reset',
    focus: 'Vagal Tone & Parasympathetic Activation',
    duration: 60,
    insight: 'Stress is often held as static in the fascia. We will use slow, deep vibrations to unlock your natural relaxation response.',
    quote: "You don't need more time; you need more space within yourself."
  },
  heavy: {
    ritual: 'The Deep Release Ritual',
    focus: 'Somatic Emotional Processing',
    duration: 90,
    insight: 'Heaviness is often stagnant energy. This ritual focuses on expressive breathwork and movement to lighten your emotional field.',
    quote: "What you carry also carries a weight that is not yours to hold."
  },
  disconnected: {
    ritual: 'The Embodiment Journey',
    focus: 'Proprioceptive Grounding & Awareness',
    duration: 60,
    insight: 'Disconnection happens when the mind and body drift. We will use tactile grounding and conscious presence to bring you back home.',
    quote: "The longest journey you will ever take is the 18 inches from your head to your heart."
  },
  anxious: {
    ritual: 'The Stillness Sanctuary',
    focus: 'Breath Retention & Coherence',
    duration: 60,
    insight: 'Anxiety is energy moving too fast. We will slow down your internal rhythm through rhythmic pacing and expansive breath.',
    quote: "In the eye of the storm, there is a place of absolute quiet."
  },
  'emotionally drained': {
    ritual: 'The Vitality Restoration',
    focus: 'Energy Body Rejuvenation',
    duration: 120,
    insight: 'Burnout requires deep replenishment. This session combines restorative somatic work with high-frequency energy alignment.',
    quote: "Rest is not the absence of movement, but the presence of peace."
  },
  'seeking clarity': {
    ritual: 'The Insight Awakening',
    focus: 'Third Eye Activation & Breath Flow',
    duration: 90,
    insight: 'Clarity emerges when the noise subsides. We will use specific breath patterns to clear mental fog and invite intuitive wisdom.',
    quote: "Silence is the language of the soul. Everything else is a poor translation."
  }
};
