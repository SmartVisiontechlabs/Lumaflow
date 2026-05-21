import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Heart, Moon } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { HeroContent } from '../../types/cms';

export default function Hero() {
  const openBooking = useBookingStore(state => state.openBooking);
  const navigate = useNavigate();
  const [content, setContent] = useState<HeroContent | null>(null);

  useEffect(() => {
    cmsService.getHeroContent()
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load dynamic hero content:', err));
  }, []);

  const heroData = content ? {
    headline: content.title,
    subheadline: content.subtitle,
    cta_text: content.primary_cta_label,
    cta_link: content.primary_cta_link,
    secondary_cta_text: content.secondary_cta_label,
    secondary_cta_link: content.secondary_cta_link
  } : {
    headline: 'Illuminate your\nhealing journey\nwith LumaFlow.',
    subheadline: 'Step into a luminous sanctuary of high-frequency somatic restoration, where ancient stillness meets the cutting edge of personal transformation. Here, we don\'t fix you—we help you remember who you are.',
    cta_text: 'Begin Your Healing Journey',
    cta_link: '/book',
    secondary_cta_text: 'Explore Healing Paths',
    secondary_cta_link: '#transformation-journey'
  };

  const handleHeroClick = () => {
    openBooking(null, { entrySource: 'hero' });
    navigate('/book');
  };

  return (
    <section className="relative min-h-[800px] lg:h-[95vh] flex items-center px-6 md:px-24 overflow-hidden bg-gradient-to-tr from-white via-cream to-[#FFFDF0] py-20 lg:py-0">
      
      {/* CINEMATIC LUMINOUS HEALING BACKGROUND */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[url('/images/luminous_healing_bg.png')] bg-cover bg-center opacity-25 mix-blend-multiply"
        />
        
        {/* Very Subtle Luminous Sun Rays / Sacred Light */}
        <div className="absolute inset-0 overflow-hidden opacity-85">
          <div className="absolute top-0 right-[20%] w-[35vw] h-full sun-beam-ray rotate-[15deg] origin-top animate-pulseGlow" style={{ animationDuration: '10s' }} />
          <div className="absolute top-0 right-[40%] w-[20vw] h-full sun-beam-ray rotate-[8deg] origin-top opacity-40 animate-pulseGlow" style={{ animationDuration: '15s' }} />
        </div>

        {/* Ambient warm gold center glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] h-[75vw] bg-[radial-gradient(circle,rgba(253,244,215,0.5)_0%,rgba(203,174,115,0.06)_50%,transparent_70%)] blur-[95px]" />
        
        {/* Ambient soft white overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F8F5F0]/10 to-[#F8F5F0]" />
        
        {/* Floating Divine Particles - Ultra Slow Stillness */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: Math.random() * 600 }}
            animate={{ 
              opacity: [0.01, 0.08, 0.01],
              y: [0, -25, 0],
              x: [0, Math.random() * 8 - 4, 0]
            }}
            transition={{ 
              duration: 25 + Math.random() * 25, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 15
            }}
            className="absolute w-[1.5px] h-[1.5px] bg-gold/25 rounded-full blur-[0.5px] pointer-events-none"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}

        {/* Translucent Sacred Geometry Texture */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-gold/[0.012] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-gold/[0.006] rounded-full pointer-events-none" />
      </div>

      {/* GLOBAL GRAIN & NOISE */}
      <div className="absolute inset-0 bg-grain pointer-events-none z-[5] opacity-[0.015] mix-blend-overlay" />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* LEFT SIDE: LUXURY HEADLINE & CTA */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 relative w-full"
          >
            <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.5em] text-gold/60 z-10 relative">
              <div className="w-8 h-[1px] bg-gold/30" />
              <span>A Sacred Space for Awakening</span>
            </div>
            
            <div className="relative">
              {/* Soft Luminous Ambient Glow Behind Headline (5-10% Opacity) */}
              <div className="absolute inset-x-0 -inset-y-4 bg-gold/6 rounded-full blur-[80px] scale-90 -z-10 pointer-events-none" />
              
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-text-dark leading-[1.1] tracking-tight max-w-[850px] font-light relative z-10">
                {heroData.headline.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {idx === 1 ? (
                      <span className="italic text-[#CBAE73] font-normal tracking-wide">{line}</span>
                    ) : (
                      line
                    )}
                    {idx < heroData.headline.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>
            </div>

            <p className="font-body text-base md:text-lg text-text-dark/50 font-light max-w-[540px] leading-relaxed relative z-10">
              {heroData.subheadline}
            </p>
          </motion.div>

          {/* Premium Dual CTA Hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto relative z-10"
          >
            {/* Primary CTA */}
            <button
              onClick={handleHeroClick}
              className="w-full sm:w-auto px-12 py-5.5 bg-[#CBAE73] text-black rounded-full text-[11px] font-bold tracking-[0.4em] uppercase transition-all duration-500 shadow-[0_15px_30px_rgba(203,174,115,0.25)] hover:bg-[#E9D5A3] hover:shadow-[0_20px_45px_rgba(203,174,115,0.35)] hover:scale-105 active:scale-98 cursor-pointer group flex items-center justify-center gap-3"
            >
              <span className="relative z-10 flex items-center gap-3">
                {heroData.cta_text} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-500" />
              </span>
            </button>

            {/* Secondary Ghost CTA */}
            <button 
              onClick={() => {
                if (heroData.secondary_cta_link.startsWith('#')) {
                  const element = document.getElementById(heroData.secondary_cta_link.substring(1));
                  element?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate(heroData.secondary_cta_link);
                }
              }}
              className="w-full sm:w-auto px-10 py-5.5 border border-gold/25 hover:border-gold/60 text-text-dark text-[11px] font-bold tracking-[0.4em] uppercase rounded-full transition-all duration-500 hover:bg-gold/5 hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center"
            >
              {heroData.secondary_cta_text}
            </button>
          </motion.div>

          {/* SACRED INDICATORS */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 2 }}
            className="flex items-center gap-12 pt-4 relative z-10"
          >
            <div className="flex items-center gap-3.5 text-[8px] font-bold uppercase tracking-[0.3em] text-text-dark/30">
              <ShieldCheck className="w-3.5 h-3.5 text-gold/30" />
              <span>Private Sanctuary</span>
            </div>
            <div className="flex items-center gap-3.5 text-[8px] font-bold uppercase tracking-[0.3em] text-text-dark/30">
              <Sparkles className="w-3.5 h-3.5 text-gold/30" />
              <span>Nervous System Centered</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE: REFINED RITUAL BOOKING CARD (With Micro Hover Dynamics) */}
        <div className="lg:col-span-4 lg:col-start-9 relative hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          >
            {/* Breathing Motion Wrapper */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Glassmorphic Panel - Lift & Shadow Transitions */}
              <div className="glass rounded-[3.5rem] p-10 space-y-8 border-white/30 shadow-[0_20px_50px_rgba(58,58,58,0.03)] hover:shadow-[0_40px_80px_rgba(203,174,115,0.14)] bg-white/[0.12] hover:bg-white/[0.2] backdrop-blur-[80px] relative overflow-hidden group transition-all duration-1000 ease-out hover:-translate-y-2 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <Moon className="w-3.5 h-3.5 text-gold" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold">Sacred Intake</p>
                  </div>
                  <h3 className="font-display text-3xl text-text-dark leading-[1.2] tracking-tight">Your <br />Personal <br />Sanctuary</h3>
                </div>

                <div className="space-y-6 relative z-10">
                  {[
                    { icon: Calendar, text: 'Select Your Moment', sub: 'Honoring your calendar' },
                    { icon: Heart, text: 'Somatic Healing', sub: 'Where transformation begins' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-5 group/item">
                      <div className="w-10 h-10 rounded-full bg-cream/50 flex items-center justify-center text-gold border border-gold/5 transition-all duration-700 group-hover/item:border-gold/20 group-hover/item:scale-105">
                        <item.icon className="w-4 h-4 stroke-[1.2]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-dark/70">{item.text}</p>
                        <p className="text-[10px] text-text-dark/35 italic font-light">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleHeroClick}
                  className="w-full py-5 bg-text-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#CBAE73] hover:text-black hover:shadow-lg transition-all duration-700 shadow-xl relative z-10 overflow-hidden cursor-pointer"
                >
                  <span className="relative z-10">Enter Sanctuary</span>
                </button>
              </div>

              {/* Decorative Texture Only */}
              <div className="absolute -bottom-12 -left-12 w-48 h-48 border border-gold/[0.01] rounded-full mix-blend-overlay pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-40 h-40 border border-gold/[0.01] rounded-full mix-blend-overlay pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* ATMOSPHERIC DEPTH TRANSITION */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream via-cream/60 to-transparent pointer-events-none z-20" />
      
    </section>
  );
}