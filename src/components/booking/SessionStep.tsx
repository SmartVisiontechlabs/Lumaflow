import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore, type Session, type Emotion } from '../../store/bookingStore';
import { ChevronRight, ChevronLeft, Sparkles, Clock, Heart } from 'lucide-react';
import StepHeading from './shared/StepHeading';

const recommendations: Record<Emotion, Session> = {
  'Stressed': {
    id: 'nervous-system-reset',
    name: 'Nervous System Reset',
    image: '/sessions/soul-alignment.png',
    duration: '90 Minutes',
    benefit: 'Deep Calm',
    description: 'A soothing journey designed to down-regulate your nervous system and release stored tension.',
    recommendation: 'Because you’re feeling stressed, your body needs a gentle invitation to return to safety.'
  },
  'Heavy': {
    id: 'deep-release-ritual',
    name: 'Deep Release Ritual',
    image: '/sessions/soul-alignment.png',
    duration: '120 Minutes',
    benefit: 'Lightness',
    description: 'Using somatic movement and breathwork to move heavy energy and find emotional buoyancy.',
    recommendation: 'Since you’re feeling heavy, we’ll focus on movement that restores your natural flow.'
  },
  'Disconnected': {
    id: 'soul-alignment',
    name: 'Soul Alignment Session',
    image: '/sessions/soul-alignment.png',
    duration: '90 Minutes',
    benefit: 'Inner Connection',
    description: 'A guided ritual to bridge the gap between mind and body, anchoring you back into your center.',
    recommendation: 'To help with feeling disconnected, this session provides a sacred space for reconnection.'
  },
  'Seeking Clarity': {
    id: 'visionary-breathwork',
    name: 'Visionary Breathwork',
    image: '/sessions/soul-alignment.png',
    duration: '60 Minutes',
    benefit: 'Insight',
    description: 'High-frequency breathwork to clear mental fog and tap into your intuitive wisdom.',
    recommendation: 'As you seek clarity, this practice will help quiet the noise and amplify your inner voice.'
  },
  'Emotionally Drained': {
    id: 'restoration-journey',
    name: 'Restoration Journey',
    image: '/sessions/soul-alignment.png',
    duration: '90 Minutes',
    benefit: 'Vitality',
    description: 'A gentle, restorative practice focused on replenishment and emotional nourishment.',
    recommendation: 'Because you’re feeling drained, we will focus entirely on refilling your emotional cup.'
  },
  'Anxious': {
    id: 'grounding-presence',
    name: 'Grounding Presence',
    image: '/sessions/soul-alignment.png',
    duration: '60 Minutes',
    benefit: 'Stability',
    description: 'Earth-centered meditation and rhythmic breathing to anchor you in the present moment.',
    recommendation: 'To soothe anxiety, we’ll use grounding techniques to help you feel stable and secure.'
  }
};

const SessionStep = () => {
  const selectedEmotion = useBookingStore(state => state.selectedEmotion);
  const setSession = useBookingStore(state => state.setSession);
  const nextStep = useBookingStore(state => state.nextStep);
  const prevStep = useBookingStore(state => state.prevStep);
  
  const recommendedSession = selectedEmotion ? recommendations[selectedEmotion] : recommendations['Disconnected'];

  const handleContinue = () => {
    setSession(recommendedSession);
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepHeading 
        tag="The Recommendation"
        title="Your Recommended Path"
        subtitle={recommendedSession.recommendation}
      />

      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 overflow-hidden flex flex-col md:flex-row min-h-[420px] relative shadow-sm">
        {/* IMAGE SECTION */}
        <div className="md:w-[45%] relative overflow-hidden bg-cream/50">
          <motion.img 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
            src={recommendedSession.image} 
            alt={recommendedSession.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 text-white space-y-2">
            <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.3em] text-gold/80">
              <Clock className="w-3 h-3" />
              {recommendedSession.duration}
            </div>
            <h3 className="font-display text-3xl">{recommendedSession.name}</h3>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="md:w-[55%] p-10 md:p-12 flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold mb-0.5">Focus</p>
                <p className="text-sm font-medium text-text-dark">{recommendedSession.benefit}</p>
              </div>
            </div>

            <p className="text-text-dark/70 font-light leading-relaxed text-lg italic">
              “{recommendedSession.description}”
            </p>
            
            <div className="p-6 bg-gold/5 rounded-2xl border border-gold/10">
              <p className="text-[8px] text-gold font-bold uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Insight
              </p>
              <p className="text-xs text-text-dark/50 font-light leading-relaxed">
                {recommendedSession.recommendation}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleContinue}
              className="flex-grow py-4 bg-text-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all duration-500 shadow-md active:scale-95"
            >
              Accept Path <ChevronRight className="inline-block w-3 h-3 ml-1" />
            </button>
            <button 
              className="px-8 py-4 bg-white/40 border border-text-dark/5 text-text-dark/40 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:border-gold/40 hover:text-gold transition-all duration-500"
            >
              Others
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={prevStep}
        className="mt-8 mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 hover:text-gold transition-colors duration-500 focus:outline-none"
      >
        <ChevronLeft className="w-3 h-3" /> Change State
      </button>
    </div>
  );
};

export default memo(SessionStep);
