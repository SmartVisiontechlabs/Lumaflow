import fs from 'fs';
import path from 'path';

const FALLBACK_FILE_PATH = path.join(process.cwd(), 'server', 'data', 'cms_fallback.json');

const INITIAL_FALLBACK_DATA = {
  hero_content: {
    id: "fallback-hero-id",
    title: "Illuminate your \nhealing journey\nwith LumaFlow.",
    subtitle: "Step into a luminous sanctuary of high-frequency somatic restoration, where ancient stillness meets the cutting edge of personal transformation. Here, we don't fix you—we help you remember who you are.",
    primary_cta_label: "Begin Your Healing Journey",
    primary_cta_link: "/book",
    secondary_cta_label: "Explore Healing Paths",
    secondary_cta_link: "#transformation-journey"
  },
  transformation_steps: [
    { id: "fallback-step-1", step_number: 1, title: "Release", subtitle: "Surrender & Empty", description: "Let go of stored tension and shed the weight of expectations. Create a quiet, empty space within your body and mind.", icon: "Wind", sort_order: 1, is_active: true },
    { id: "fallback-step-2", step_number: 2, title: "Reconnect", subtitle: "Listen & Witness", description: "Tune into the subtle rhythm of your breathing. Gently bring your awareness back to the organic wisdom of the present moment.", icon: "Heart", sort_order: 2, is_active: true },
    { id: "fallback-step-3", step_number: 3, title: "Restore", subtitle: "Nourish & Soften", description: "Nourish your nervous system and re-align your natural frequencies. Sink into a state of deep, restorative rest.", icon: "Sparkles", sort_order: 3, is_active: true },
    { id: "fallback-step-4", step_number: 4, title: "Illuminate", subtitle: "Radiate & Expand", description: "Step into your natural brightness and glow. Radiate peace, vitality, and heart-centered, creative clarity.", icon: "Sun", sort_order: 4, is_active: true }
  ],
  founder_bio: {
    id: "fallback-founder-id",
    name: "Alanna",
    title: "Meet Alanna",
    bio: "Alanna is a somatic practitioner and guide devoted to helping you reconnect with your natural state of calm through breath, movement, and awareness.",
    credentials: ["Certified Somatic Facilitator", "Breathwork Practitioner (1,200+ Hours)"],
    quote: "I created Lumaflow as a space where you don’t have to fix yourself — only remember who you are.",
    image_url: "/alanna-new.jpeg",
    button_label: "Begin Your Journey",
    button_link: "/book"
  },
  quotes: [
    { id: "fallback-quote-1", quote: "Transforming negative energy into love and light.", author: "Client Reflection", sort_order: 1, is_featured: true }
  ],
  reviews: [
    { id: "fallback-review-1", client_name: "Elena S.", review_text: "Lumaflow changed my relationship with my own body. I finally feel at home in my own skin. The breathwork sessions are a sacred hour of pure, unfiltered return.", program: "Somatic Breathwork Client", is_featured: false, sort_order: 1, rating: 5 },
    { id: "fallback-review-2", client_name: "Julian M.", review_text: "Walking into these sessions feels like leaving the weight of the world at the door. Alanna creates a container of unmatched safety, light, and grace.", program: "Private Practice Integration", is_featured: true, sort_order: 2, rating: 5 },
    { id: "fallback-review-3", client_name: "Sophia R.", review_text: "A profound shift in my nervous system. After months of chronic stress, Lumaflow helped me locate a well of deep stillness I didn't know I still possessed.", program: "Deep Meditation Immersion", is_featured: false, sort_order: 3, rating: 5 }
  ],
  offerings: [
    { id: "fallback-offering-1", title: "Breathwork", description: "Release held tension and emotional heaviness.", duration: 60, price: 150, image_url: "/breathwork.jpg", is_featured: false, is_active: true, sort_order: 1 },
    { id: "fallback-offering-2", title: "Somatic Flow", description: "Reconnect body awareness and nervous system ease.", duration: 90, price: 180, image_url: "/somatic.jpg", is_featured: true, is_active: true, sort_order: 2 },
    { id: "fallback-offering-3", title: "Deep Meditation", description: "Anchor into profound stillness and inner quiet.", duration: 60, price: 120, image_url: "/meditation.jpg", is_featured: false, is_active: true, sort_order: 3 }
  ],
  intelligence_matrix: [
    { id: "fallback-matrix-1", journey: "Breathwork", feeling: "heavy", recommended_ritual: "Deep Release Ritual", duration: 90, recommended_plan: "breathwork", focus: "Cathartic Breath & Cellular Release", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-2", journey: "Breathwork", feeling: "emotionally drained", recommended_ritual: "Deep Release Ritual", duration: 90, recommended_plan: "breathwork", focus: "Cellular Renewal & Energetic Restoration", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-3", journey: "Breathwork", feeling: "stressed", recommended_ritual: "Nervous System Reset", duration: 60, recommended_plan: "breathwork", focus: "Vagal Tone & Parasympathetic Coherence", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-4", journey: "Breathwork", feeling: "anxious", recommended_ritual: "Nervous System Reset", duration: 60, recommended_plan: "breathwork", focus: "Coherence Breathing & Panic Release", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-5", journey: "Breathwork", feeling: "disconnected", recommended_ritual: "Emotional Detox", duration: 90, recommended_plan: "breathwork", focus: "Somatic Reconnection through Breath", confidence_score: "Strong Match", is_active: true },
    { id: "fallback-matrix-6", journey: "Breathwork", feeling: "seeking clarity", recommended_ritual: "Emotional Detox", duration: 90, recommended_plan: "breathwork", focus: "Mental Fog Clearing & Intuition Opening", confidence_score: "Strong Match", is_active: true },
    { id: "fallback-matrix-7", journey: "Somatic Flow", feeling: "heavy", recommended_ritual: "Vitality Restoration", duration: 120, recommended_plan: "somatic", focus: "Energy Body Rejuvenation & Fascia Flow", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-8", journey: "Somatic Flow", feeling: "emotionally drained", recommended_ritual: "Vitality Restoration", duration: 120, recommended_plan: "somatic", focus: "Deep Replenishment & Energy Body Reset", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-9", journey: "Somatic Flow", feeling: "stressed", recommended_ritual: "Embodiment Journey", duration: 60, recommended_plan: "somatic", focus: "Myofascial Release & Rhythmic Flow", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-10", journey: "Somatic Flow", feeling: "anxious", recommended_ritual: "Embodiment Journey", duration: 60, recommended_plan: "somatic", focus: "Grounding Sequence & Sensory Anchoring", confidence_score: "Strong Match", is_active: true },
    { id: "fallback-matrix-11", journey: "Somatic Flow", feeling: "disconnected", recommended_ritual: "Sacred Body Flow", duration: 90, recommended_plan: "somatic", focus: "Proprioceptive Grounding & Integration", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-12", journey: "Somatic Flow", feeling: "seeking clarity", recommended_ritual: "Sacred Body Flow", duration: 90, recommended_plan: "somatic", focus: "Body Wisdom & Intuitive Movement", confidence_score: "Strong Match", is_active: true },
    { id: "fallback-matrix-13", journey: "Deep Meditation", feeling: "heavy", recommended_ritual: "Expansion Meditation", duration: 90, recommended_plan: "meditation", focus: "Transcendental Awareness & Spaciousness", confidence_score: "Strong Match", is_active: true },
    { id: "fallback-matrix-14", journey: "Deep Meditation", feeling: "emotionally drained", recommended_ritual: "Expansion Meditation", duration: 90, recommended_plan: "meditation", focus: "Spiritual Restoration & Light Infusion", confidence_score: "Strong Match", is_active: true },
    { id: "fallback-matrix-15", journey: "Deep Meditation", feeling: "stressed", recommended_ritual: "Stillness Ritual", duration: 45, recommended_plan: "meditation", focus: "Focus Anchoring & Thought Uncoupling", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-16", journey: "Deep Meditation", feeling: "anxious", recommended_ritual: "Stillness Ritual", duration: 45, recommended_plan: "meditation", focus: "Present-Moment Anchoring & Worry Release", confidence_score: "Highly Aligned", is_active: true },
    { id: "fallback-matrix-17", journey: "Deep Meditation", feeling: "disconnected", recommended_ritual: "Deep Stillness", duration: 60, recommended_plan: "meditation", focus: "Pure Consciousness & Presence Return", confidence_score: "Strong Match", is_active: true },
    { id: "fallback-matrix-18", journey: "Deep Meditation", feeling: "seeking clarity", recommended_ritual: "Deep Stillness", duration: 60, recommended_plan: "meditation", focus: "Intuitive Wisdom & Inner Guidance", confidence_score: "Highly Aligned", is_active: true }
  ]
};

export const getLocalFallbackData = (tableName: string) => {
  try {
    if (!fs.existsSync(FALLBACK_FILE_PATH)) {
      const dir = path.dirname(FALLBACK_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(INITIAL_FALLBACK_DATA, null, 2));
    }
    const data = JSON.parse(fs.readFileSync(FALLBACK_FILE_PATH, 'utf8'));
    return data[tableName] || null;
  } catch (e) {
    console.error(`Error reading fallback data for ${tableName}:`, e);
    return (INITIAL_FALLBACK_DATA as any)[tableName] || null;
  }
};

export const saveLocalFallbackData = (tableName: string, updateFn: (data: any) => any) => {
  try {
    if (!fs.existsSync(FALLBACK_FILE_PATH)) {
      const dir = path.dirname(FALLBACK_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(INITIAL_FALLBACK_DATA, null, 2));
    }
    const data = JSON.parse(fs.readFileSync(FALLBACK_FILE_PATH, 'utf8'));
    const currentTableData = data[tableName] || (INITIAL_FALLBACK_DATA as any)[tableName];
    const newTableData = updateFn(currentTableData);
    data[tableName] = newTableData;
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data, null, 2));
    return newTableData;
  } catch (e) {
    console.error(`Error saving fallback data for ${tableName}:`, e);
    return null;
  }
};
