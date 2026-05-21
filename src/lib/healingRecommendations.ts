/**
 * Lumaflow Healing Intelligence System
 * 
 * Centralized recommendation engine. All logic lives here — 
 * CMS-ready, component-agnostic, future-proof.
 * 
 * Architecture: Journey + Feeling → HealingRecommendation
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConfidenceLevel = 'Highly Aligned' | 'Strong Match' | 'Resonant Path';

export interface HealingRecommendation {
  /** Ritual name shown on SessionStep */
  ritual: string;
  /** Short ritual focus descriptor */
  focus: string;
  /** Primary recommended duration in minutes */
  duration: number;
  /** Why this ritual was specifically chosen for this combination */
  insight: string;
  /** Emotional anchor quote shown on SessionStep */
  quote: string;
  /** Confidence tier */
  confidence: ConfidenceLevel;
  /** One-sentence human-readable confidence explanation */
  confidenceReason: string;
  /** Alternative durations the user can choose from (excludes primary) */
  altDurations: number[];
  /** Ritual archetype for potential image/icon mapping */
  archetype: 'breathwork' | 'somatic' | 'meditation' | 'integration';
}

// ─── Journey × Feeling Matrix ─────────────────────────────────────────────────

/**
 * The full recommendation matrix.
 * Key: `${journey}::${feeling}` (lowercase, normalized)
 *
 * To add new combinations, simply add an entry here.
 * No component changes needed.
 */
const RECOMMENDATION_MATRIX: Record<string, HealingRecommendation> = {

  // ── BREATHWORK × HEAVY ───────────────────────────────────────────────────
  'breathwork::heavy': {
    ritual: 'Deep Release Ritual',
    focus: 'Cathartic Breath & Cellular Release',
    duration: 90,
    insight: 'Heaviness often reflects stagnant emotional energy held in the body\'s fascia. Active pranayama and vibrational breath cycles create the internal pressure needed to move what has been stuck — flushing the emotional system and restoring natural flow.',
    quote: 'Letting go is not an action. It is a surrender.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Breathwork is the primary clinical modality for processing and releasing heavy, stagnant emotional charge.',
    altDurations: [60, 120],
    archetype: 'breathwork',
  },

  // ── BREATHWORK × EMOTIONALLY DRAINED ─────────────────────────────────────
  'breathwork::emotionally drained': {
    ritual: 'Deep Release Ritual',
    focus: 'Cellular Renewal & Energetic Restoration',
    duration: 90,
    insight: 'When emotionally drained, the breath has often become shallow and restricted. Slow circular breathing rebuilds the oxygen-rich environment that allows emotional energy to replenish from the inside out.',
    quote: 'What is empty can also be made whole.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Breathwork directly addresses the depleted energetic state that underlies emotional fatigue.',
    altDurations: [60, 120],
    archetype: 'breathwork',
  },

  // ── BREATHWORK × STRESSED ─────────────────────────────────────────────────
  'breathwork::stressed': {
    ritual: 'Nervous System Reset',
    focus: 'Vagal Tone & Parasympathetic Coherence',
    duration: 60,
    insight: 'Stress is often held as chronic activation in the nervous system. Structured breath retention techniques — 4-7-8 patterns and box breathing — guide your brainwaves from beta into deep, recovery-rich alpha states.',
    quote: 'Breathe in space. Breathe out quiet.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Controlled breathwork is the fastest evidence-based pathway to deactivating the stress response.',
    altDurations: [45, 90],
    archetype: 'breathwork',
  },

  // ── BREATHWORK × ANXIOUS ─────────────────────────────────────────────────
  'breathwork::anxious': {
    ritual: 'Nervous System Reset',
    focus: 'Coherence Breathing & Panic Release',
    duration: 60,
    insight: 'Anxiety is energy moving faster than the body can process. Slow, rhythmic breathwork — particularly coherence breathing at 5.5 breaths per minute — directly calms the amygdala and restores a sense of safe embodiment.',
    quote: 'In the eye of the storm, there is a place of absolute quiet.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Breathwork creates immediate physiological changes that interrupt the anxiety feedback loop.',
    altDurations: [45, 90],
    archetype: 'breathwork',
  },

  // ── BREATHWORK × DISCONNECTED ────────────────────────────────────────────
  'breathwork::disconnected': {
    ritual: 'Emotional Detox',
    focus: 'Somatic Reconnection through Breath',
    duration: 90,
    insight: 'Disconnection often signals a protective withdrawal of awareness from the body. Circular breathing patterns dissolve the habitual mind-body split, using the breath as a bridge back to felt sensation and inner knowing.',
    quote: 'The answer is not in the noise. It is in the depth of your breath.',
    confidence: 'Strong Match',
    confidenceReason: 'Breathwork is highly effective at dissolving dissociation and rebuilding somatic awareness.',
    altDurations: [60, 120],
    archetype: 'breathwork',
  },

  // ── BREATHWORK × SEEKING CLARITY ─────────────────────────────────────────
  'breathwork::seeking clarity': {
    ritual: 'Emotional Detox',
    focus: 'Mental Fog Clearing & Intuition Opening',
    duration: 90,
    insight: 'Clarity is obscured by the accumulation of unprocessed thought and emotion. Conscious circular breathing creates a gentle inner purge — clearing the field of mental static to reveal the clear signal beneath.',
    quote: 'The answer was always there. We simply clear the static.',
    confidence: 'Strong Match',
    confidenceReason: 'Breathwork creates altered states that reliably access intuition beyond analytical mind.',
    altDurations: [60, 120],
    archetype: 'breathwork',
  },

  // ── SOMATIC FLOW × HEAVY ─────────────────────────────────────────────────
  'somatic flow::heavy': {
    ritual: 'Vitality Restoration',
    focus: 'Energy Body Rejuvenation & Fascia Flow',
    duration: 120,
    insight: 'Heaviness accumulates in the connective tissue — the fascia — as a form of chronic muscle bracing. Slow, passive somatic release postures held over time create the deep myofascial unwinding needed to restore genuine lightness.',
    quote: 'Rest is the soil from which vitality grows.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Somatic bodywork directly addresses the physical substrate of emotional heaviness in the fascia.',
    altDurations: [60, 90],
    archetype: 'somatic',
  },

  // ── SOMATIC FLOW × EMOTIONALLY DRAINED ───────────────────────────────────
  'somatic flow::emotionally drained': {
    ritual: 'Vitality Restoration',
    focus: 'Deep Replenishment & Energy Body Reset',
    duration: 120,
    insight: 'Burnout requires more than rest — it requires intelligent replenishment. Restorative somatic postures combined with conscious body mapping allow the nervous system to shift from survival mode into genuine recovery.',
    quote: 'You cannot pour from an empty vessel. Let us refill yours.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Long-form restorative somatic work is the gold standard for nervous system recovery from burnout.',
    altDurations: [60, 90],
    archetype: 'somatic',
  },

  // ── SOMATIC FLOW × STRESSED ───────────────────────────────────────────────
  'somatic flow::stressed': {
    ritual: 'Embodiment Journey',
    focus: 'Myofascial Release & Rhythmic Flow',
    duration: 60,
    insight: 'Stress creates chronic holding patterns in the body — tight shoulders, a braced jaw, a contracted belly. Slow rhythmic somatic movement and myofascial release dissolve these physical stress signatures, signaling safety to the nervous system.',
    quote: 'Your body is the temple. Movement is the prayer.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Somatic movement is clinically validated for releasing the physical holding patterns of chronic stress.',
    altDurations: [45, 90],
    archetype: 'somatic',
  },

  // ── SOMATIC FLOW × ANXIOUS ────────────────────────────────────────────────
  'somatic flow::anxious': {
    ritual: 'Embodiment Journey',
    focus: 'Grounding Sequence & Sensory Anchoring',
    duration: 60,
    insight: 'Anxiety pulls awareness into the future. Slow, tactile somatic exercises — orienting to physical sensation, weight and texture — anchor awareness back into the present moment of the body, interrupting the anxiety loop.',
    quote: 'Feel the ground beneath you. It has always held you.',
    confidence: 'Strong Match',
    confidenceReason: 'Somatic grounding is the most direct pathway to interrupting anxiety\'s future-orientation.',
    altDurations: [45, 90],
    archetype: 'somatic',
  },

  // ── SOMATIC FLOW × DISCONNECTED ───────────────────────────────────────────
  'somatic flow::disconnected': {
    ritual: 'Sacred Body Flow',
    focus: 'Proprioceptive Grounding & Integration',
    duration: 90,
    insight: 'Disconnection is a withdrawal of consciousness from the body\'s territory. Through tactile self-contact, spatial awareness exercises, and mindful movement, this session rebuilds the felt sense of being at home in physical form.',
    quote: 'To inhabit the body is to walk on holy ground.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Somatic practice is the most direct modality for rebuilding body-mind connection and felt presence.',
    altDurations: [60, 120],
    archetype: 'somatic',
  },

  // ── SOMATIC FLOW × SEEKING CLARITY ───────────────────────────────────────
  'somatic flow::seeking clarity': {
    ritual: 'Sacred Body Flow',
    focus: 'Body Wisdom & Intuitive Movement',
    duration: 90,
    insight: 'Clarity is often a body signal waiting to be heard. When the mind is searching, the body already knows. Intuitive somatic movement creates the conditions for embodied wisdom to surface naturally.',
    quote: 'The body knows what the mind is still trying to learn.',
    confidence: 'Strong Match',
    confidenceReason: 'Somatic practices access pre-cognitive body wisdom that transcends mental analysis.',
    altDurations: [60, 120],
    archetype: 'somatic',
  },

  // ── DEEP MEDITATION × HEAVY ───────────────────────────────────────────────
  'deep meditation::heavy': {
    ritual: 'Expansion Meditation',
    focus: 'Transcendental Awareness & Spaciousness',
    duration: 90,
    insight: 'Heavy states contract the sense of self into a small, dense point. Guided expansion meditation — using cosmic imagery and awareness-widening techniques — restores the experience of spaciousness that naturally dissolves the weight of density.',
    quote: 'You are not a drop in the ocean. You are the entire ocean in a drop.',
    confidence: 'Strong Match',
    confidenceReason: 'Expansion meditation creates psychological distance from heavy emotional content, providing immediate relief.',
    altDurations: [60, 120],
    archetype: 'meditation',
  },

  // ── DEEP MEDITATION × EMOTIONALLY DRAINED ────────────────────────────────
  'deep meditation::emotionally drained': {
    ritual: 'Expansion Meditation',
    focus: 'Spiritual Restoration & Light Infusion',
    duration: 90,
    insight: 'When emotionally depleted, the spiritual dimension is often the fastest pathway to restoration. Guided astral expansion and cosmic awareness practices replenish at the source level — the consciousness itself — rather than just the symptomatic body.',
    quote: 'Rest in the infinite. You are always held.',
    confidence: 'Strong Match',
    confidenceReason: 'Transcendental meditation states are highly restorative for deep emotional exhaustion.',
    altDurations: [60, 120],
    archetype: 'meditation',
  },

  // ── DEEP MEDITATION × STRESSED ────────────────────────────────────────────
  'deep meditation::stressed': {
    ritual: 'Stillness Ritual',
    focus: 'Focus Anchoring & Thought Uncoupling',
    duration: 45,
    insight: 'Stress fills the mind with urgent, looping thoughts. Mindfulness anchors — returning attention to a single point of focus — interrupt the thought cascade. Sound vibration further slows brainwave activity into calm, coherent states.',
    quote: 'Quiet the mind, and the soul will speak.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Meditation is the gold-standard intervention for cognitive stress — it directly targets the thought patterns driving it.',
    altDurations: [60, 90],
    archetype: 'meditation',
  },

  // ── DEEP MEDITATION × ANXIOUS ─────────────────────────────────────────────
  'deep meditation::anxious': {
    ritual: 'Stillness Ritual',
    focus: 'Present-Moment Anchoring & Worry Release',
    duration: 45,
    insight: 'Anxiety lives in the future — in projected scenarios of what might happen. Mindfulness meditation, specifically noting practice, gently returns awareness to the safety of the present moment, dissolving the fuel that anxiety runs on.',
    quote: 'In this moment, right now, you are safe.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Mindfulness meditation has the strongest evidence base of any intervention for anxiety.',
    altDurations: [60, 90],
    archetype: 'meditation',
  },

  // ── DEEP MEDITATION × DISCONNECTED ───────────────────────────────────────
  'deep meditation::disconnected': {
    ritual: 'Deep Stillness',
    focus: 'Pure Consciousness & Presence Return',
    duration: 60,
    insight: 'Disconnection dissolves when awareness rests in its own nature. Void meditation — observing the observer — returns consciousness to the fundamental sense of being that underlies all states and conditions.',
    quote: 'Silence is the language of clarity.',
    confidence: 'Strong Match',
    confidenceReason: 'Non-dual meditation practices are uniquely suited to healing the sense of disconnection from self.',
    altDurations: [45, 90],
    archetype: 'meditation',
  },

  // ── DEEP MEDITATION × SEEKING CLARITY ────────────────────────────────────
  'deep meditation::seeking clarity': {
    ritual: 'Deep Stillness',
    focus: 'Intuitive Wisdom & Inner Guidance',
    duration: 60,
    insight: 'Clarity is not found by thinking harder — it emerges when mental activity quiets. Deep stillness meditation creates the inner silence in which genuine insight and intuitive direction can naturally arise.',
    quote: 'Silence is the language of the soul. Everything else is a translation.',
    confidence: 'Highly Aligned',
    confidenceReason: 'Meditation is the primary tool for accessing the clarity that lies beneath mental noise.',
    altDurations: [45, 90],
    archetype: 'meditation',
  },
};

// ─── Default fallback ─────────────────────────────────────────────────────────

const DEFAULT_RECOMMENDATION: HealingRecommendation = {
  ritual: 'Sacred Alignment Session',
  focus: 'Holistic Centering & Integration',
  duration: 60,
  insight: 'A complete centering session combining breathwork, somatic awareness, and stillness to meet you exactly where you are.',
  quote: 'Every moment of genuine stillness is a seed of transformation.',
  confidence: 'Resonant Path',
  confidenceReason: 'A holistic approach supports all emotional states and healing intentions.',
  altDurations: [45, 90, 120],
  archetype: 'integration',
};

// ─── Engine ───────────────────────────────────────────────────────────────────

/**
 * Get the full healing recommendation for a journey + feeling combination.
 * Normalizes inputs, matches against the matrix, falls back gracefully.
 */
export function getHealingRecommendation(
  journey: string,
  feeling: string
): HealingRecommendation {
  const normalizedJourney = journey.toLowerCase().trim();
  const normalizedFeeling = feeling.toLowerCase().trim();

  const key = `${normalizedJourney}::${normalizedFeeling}`;

  if (RECOMMENDATION_MATRIX[key]) {
    return RECOMMENDATION_MATRIX[key];
  }

  // Partial journey match fallback
  const partialMatch = Object.keys(RECOMMENDATION_MATRIX).find((k) => {
    const [j, f] = k.split('::');
    return normalizedJourney.includes(j) || j.includes(normalizedJourney);
  });

  if (partialMatch) {
    return RECOMMENDATION_MATRIX[partialMatch];
  }

  return DEFAULT_RECOMMENDATION;
}

/**
 * Get confidence display config for a given level.
 */
export function getConfidenceConfig(confidence: ConfidenceLevel): {
  label: string;
  color: string;
  bgColor: string;
  description: string;
} {
  switch (confidence) {
    case 'Highly Aligned':
      return {
        label: 'Highly Aligned',
        color: 'text-gold',
        bgColor: 'bg-gold/10 border border-gold/20',
        description: 'This ritual was specifically designed for your exact combination.',
      };
    case 'Strong Match':
      return {
        label: 'Strong Match',
        color: 'text-gold/80',
        bgColor: 'bg-gold/[0.07] border border-gold/10',
        description: 'This ritual closely resonates with your current state.',
      };
    case 'Resonant Path':
    default:
      return {
        label: 'Resonant Path',
        color: 'text-gold/60',
        bgColor: 'bg-gold/[0.05] border border-gold/[0.07]',
        description: 'This ritual offers a broad, supportive healing container.',
      };
  }
}

/**
 * Get all available duration options for a recommendation,
 * merging the primary duration and altDurations into a sorted list.
 */
export function getAllDurationOptions(rec: HealingRecommendation): number[] {
  return [...new Set([rec.duration, ...rec.altDurations])].sort((a, b) => a - b);
}
