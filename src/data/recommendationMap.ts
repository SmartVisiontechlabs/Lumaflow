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

export const ritualJourneyMap: Record<string, Recommendation[]> = {
  'The Nervous System Reset': [
    {
      ritual: 'The Stillness Sanctuary',
      focus: 'Post-Reset Grounding',
      duration: 60,
      insight: 'Now that your nerves are calm, we anchor that peace into deep cellular memory.',
      quote: "Peace is not a state; it is a foundation."
    },
    {
      ritual: 'The Embodiment Journey',
      focus: 'Integration & Presence',
      duration: 60,
      insight: 'Following stillness, we invite gentle movement to inhabit your new state.',
      quote: "To be present is to be home."
    }
  ],
  'The Deep Release Ritual': [
    {
      ritual: 'The Nervous System Reset',
      focus: 'Post-Release Soothing',
      duration: 60,
      insight: 'After major emotional release, we must soothe the pathways we just cleared.',
      quote: "Gentleness is the highest form of strength."
    },
    {
      ritual: 'The Vitality Restoration',
      focus: 'Energy Replenishment',
      duration: 120,
      insight: 'With the old weight gone, we now fill your space with pure, vibrant energy.',
      quote: "Nature abhors a vacuum; fill yours with light."
    }
  ],
  'The Embodiment Journey': [
    {
      ritual: 'The Insight Awakening',
      focus: 'Mind-Body Wisdom',
      duration: 90,
      insight: 'Now that you are back in your body, we can listen to the wisdom it holds.',
      quote: "The body knows what the mind is still trying to learn."
    }
  ],
  'The Stillness Sanctuary': [
    {
      ritual: 'The Insight Awakening',
      focus: 'Clarity from Silence',
      duration: 90,
      insight: 'From the depth of your silence, your true direction will emerge.',
      quote: "Clarity is the gift of the quiet mind."
    }
  ],
  'The Vitality Restoration': [
    {
      ritual: 'The Embodiment Journey',
      focus: 'Sustained Presence',
      duration: 60,
      insight: 'Maintain your new high-frequency state through conscious embodiment.',
      quote: "Vitality is a practice, not a destination."
    }
  ],
  'The Insight Awakening': [
    {
      ritual: 'The Stillness Sanctuary',
      focus: 'Wisdom Preservation',
      duration: 60,
      insight: 'Guard your new insights by returning to the stillness where they were born.',
      quote: "Keep your treasures in the vault of silence."
    }
  ]
};

export const followUpMap: Record<string, Recommendation[]> = {
  heavy: [
    {
      ritual: 'The Stillness Sanctuary',
      focus: 'Deep Grounding',
      duration: 60,
      insight: 'Following a heavy release, stillness allows the new space to settle.',
      quote: "Silence is the sanctuary of the soul."
    },
    {
      ritual: 'The Embodiment Journey',
      focus: 'Integration',
      duration: 60,
      insight: 'Gently returning to the body to inhabit the lightness you have created.',
      quote: "To inhabit the body is to be home."
    },
    {
      ritual: 'Sacred Nervous System Reset',
      focus: 'System Harmonization',
      duration: 60,
      insight: 'Fine-tuning the nervous system to maintain emotional fluidity.',
      quote: "Flow is the natural state of being."
    }
  ],
  'emotionally drained': [
    {
      ritual: 'The Vitality Restoration',
      focus: 'Deep Replenishment',
      duration: 120,
      insight: 'When empty, we must fill the cup from the source of all vitality.',
      quote: "Rest is not idleness; it is restoration."
    },
    {
      ritual: 'Gentle Nervous System Recovery',
      focus: 'Soft Reset',
      duration: 45,
      insight: 'A soft, supportive touch for a system that has given everything.',
      quote: "Gentleness is the highest form of power."
    },
    {
      ritual: 'Sacred Body Flow',
      focus: 'Rhythmic Renewal',
      duration: 60,
      insight: 'Slow, rhythmic movement to invite energy back into the field.',
      quote: "Energy flows where attention goes."
    }
  ],
  overwhelmed: [
    {
      ritual: 'Breath & Presence Reset',
      focus: 'Immediate Calm',
      duration: 30,
      insight: 'Returning to the anchor of the breath to clear the mental noise.',
      quote: "One breath is all it takes to return."
    },
    {
      ritual: 'Somatic Grounding Session',
      focus: 'Earth Connection',
      duration: 45,
      insight: 'Feeling the solid support beneath you when the world feels too fast.',
      quote: "The earth always holds you."
    },
    {
      ritual: 'Inner Stillness Practice',
      focus: 'Centering',
      duration: 60,
      insight: 'Finding the quiet center in the eye of the storm.',
      quote: "Center yourself, and the storm passes."
    }
  ],
  anxious: [
    {
      ritual: 'Guided Nervous System Calm',
      focus: 'Co-regulation',
      duration: 60,
      insight: 'A guided journey into safety and parasympathetic ease.',
      quote: "Safety is the prerequisite for healing."
    },
    {
      ritual: 'Breath Regulation Ritual',
      focus: 'Vagal Toning',
      duration: 45,
      insight: 'Using the breath as a tool to signal safety to the brain.',
      quote: "Breathe, and the body remembers peace."
    },
    {
      ritual: 'Somatic Reset',
      focus: 'Pattern Interruption',
      duration: 60,
      insight: 'Breaking the loops of anxiety through conscious physical presence.',
      quote: "Presence is the antidote to fear."
    }
  ],
  neutral: [
    {
      ritual: 'The Embodiment Journey',
      focus: 'Expansion',
      duration: 60,
      insight: 'Moving from neutral into a state of vibrant, conscious expansion.',
      quote: "Neutrality is the doorway to infinity."
    },
    {
      ritual: 'Sacred Body Flow',
      focus: 'Creative Expression',
      duration: 60,
      insight: 'Allowing the body to express the subtle energies of the present moment.',
      quote: "Movement is the song of the body."
    }
  ]
};

export interface DynamicRecommendation {
  ritual: string;
  focus: string;
  duration: number;
  insight: string;
  quote: string;
}

export const getDynamicRecommendation = (journey: string, feeling: string): DynamicRecommendation => {
  const f = feeling.toLowerCase();
  const j = journey.toLowerCase();

  if (j.includes('breathwork')) {
    if (f === 'heavy' || f === 'emotionally drained') {
      return {
        ritual: 'Deep Release Ritual',
        focus: 'Cathartic Breath & Cellular Release',
        duration: 90,
        insight: 'Release deep-seated emotional stagnation. Using active pranayama and vibrational release, we flush the emotional system to restore flow.',
        quote: "Letting go is not an action; it is a surrender."
      };
    } else if (f === 'stressed' || f === 'anxious') {
      return {
        ritual: 'Nervous System Reset',
        focus: 'Vagal Tone & Parasympathetic Coherence',
        duration: 60,
        insight: 'Soothe an overactive stress response. Slow, structured breath retention techniques guide your brainwaves into deep, recovery states.',
        quote: "Breathe in space, breathe out quiet."
      };
    } else { // disconnected, seeking clarity, default
      return {
        ritual: 'Emotional Detox',
        focus: 'Somatic Emotional Processing',
        duration: 90,
        insight: 'Reconnect with your inner wisdom. Circular breathing patterns dissolve the boundaries of the mind to reveal raw clarity.',
        quote: "The answer is not in the noise; it is in the depth of your breath."
      };
    }
  } else if (j.includes('somatic')) {
    if (f === 'heavy' || f === 'emotionally drained') {
      return {
        ritual: 'Vitality Restoration',
        focus: 'Energy Body Rejuvenation & Flow',
        duration: 120,
        insight: 'Replenish a fully depleted system. Gentle, passive somatic release postures help your muscles and fascia store vital energy.',
        quote: "Rest is the soil from which vitality grows."
      };
    } else if (f === 'stressed' || f === 'anxious') {
      return {
        ritual: 'Embodiment Journey',
        focus: 'Myofascial Release & Rhythmic Flow',
        duration: 60,
        insight: 'Dissolve anxiety and tension locked in the tissue. Unwinding patterns and slow, rhythmic movement restore somatic harmony.',
        quote: "Your body is the temple; movement is the prayer."
      };
    } else { // disconnected, seeking clarity
      return {
        ritual: 'Sacred Body Flow',
        focus: 'Proprioceptive Grounding & Integration',
        duration: 90,
        insight: 'Ground back into physical form. Through tactile alignment and spatial awareness, we bridge the gap between mind and flesh.',
        quote: "To inhabit the body is to walk on holy ground."
      };
    }
  } else { // meditation
    if (f === 'heavy' || f === 'emotionally drained') {
      return {
        ritual: 'Expansion Meditation',
        focus: 'Transcendental Awareness & Light',
        duration: 90,
        insight: 'Rise above heavy physical exhaustion. Guided astral expansion and cosmic awareness restore your spiritual vitality.',
        quote: "You are not a drop in the ocean; you are the entire ocean in a drop."
      };
    } else if (f === 'stressed' || f === 'anxious') {
      return {
        ritual: 'Stillness Ritual',
        focus: 'Focus Anchoring & Thought Uncoupling',
        duration: 45,
        insight: 'Calm the racing chattering mind. We use mindfulness anchors and sound vibration to slow down rapid thought loops.',
        quote: "Quiet the mind, and the soul will speak."
      };
    } else { // disconnected, seeking clarity
      return {
        ritual: 'Deep Stillness',
        focus: 'Pure Consciousness & Silence',
        duration: 60,
        insight: 'Enter the void of absolute peace. Void meditation practices connect you back to the observer state of pure clarity.',
        quote: "Silence is the language of clarity."
      };
    }
  }
};

