import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Heart, Moon } from 'lucide-react';

export default function Hero() {
  const openBooking = useBookingStore(state => state.openBooking);

  return (
    <section className="relative h-[80vh] min-h-[700px] flex items-center px-6 md:px-24 overflow-hidden bg-cream">
      
      {/* CINEMATIC LUMINOUS HEALING BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 1, 0] }}
          transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[url('/images/luminous_healing_bg.png')] bg-cover bg-center"
        />
        
        {/* Massive Top-Center Sunlight Bloom */}
        <motion.div 
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[100%] bg-[radial-gradient(circle_at_center,rgba(255,253,240,0.8)_0%,rgba(212,175,55,0.15)_30%,transparent_70%)] blur-[120px] pointer-events-none z-10" 
        />
        
        {/* Layered Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/5 to-cream" />
        <div className="absolute inset-0 mist-overlay opacity-25" />
        
        {/* Atmospheric Haze Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,0.1)_0%,transparent_60%)] pointer-events-none" />
        
        {/* Floating Divine Particles - Ultra Slow Stillness */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: Math.random() * 800 }}
            animate={{ 
              opacity: [0.02, 0.1, 0.02],
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0]
            }}
            transition={{ 
              duration: 30 + Math.random() * 30, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 20
            }}
            className="absolute w-[1.5px] h-[1.5px] bg-gold/15 rounded-full blur-[1px] pointer-events-none"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}

        {/* Translucent Sacred Geometry Texture - Barely Visible (1.5%) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-gold/[0.015] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-gold/[0.008] rounded-full pointer-events-none" />
      </div>

      {/* GLOBAL GRAIN & NOISE */}
      <div className="absolute inset-0 bg-grain pointer-events-none z-[5] opacity-[0.02] mix-blend-overlay" />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* LEFT SIDE: LUXURY HEADLINE & CTA */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.7em] text-gold/40">
              <div className="w-10 h-[1px] bg-gold/15" />
              <span>Sacred Sanctuary</span>
            </div>
            
            <h1 className="font-display text-6xl md:text-[6rem] text-text-dark leading-[0.8] tracking-tightest max-w-[850px]">
              Return to your <br />
              <span className="italic text-gold/80 font-medium">natural state</span> <br />
              of alignment.
            </h1>

            <p className="font-body text-lg md:text-xl text-text-dark/40 font-light max-w-[540px] leading-relaxed">
              “Enter a sanctuary of high-frequency somatic healing, where ancient stillness meets the cutting edge of human transformation.”
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center gap-14"
          >
            <button
              onClick={openBooking}
              className="px-12 py-5.5 bg-text-dark text-white rounded-full text-[11px] font-bold tracking-[0.5em] uppercase transition-all duration-1000 shadow-luxury hover:bg-gold hover:scale-[1.01] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-4">
                Begin Ritual <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-700" />
              </span>
              <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
            </button>

            <button className="text-[10px] font-bold uppercase tracking-[0.5em] text-text-dark/30 hover:text-gold transition-colors duration-700">
              Explore The Path
            </button>
          </motion.div>

          {/* SACRED INDICATORS */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5, duration: 3 }}
            className="flex items-center gap-16 pt-4"
          >
            <div className="flex items-center gap-4 text-[8px] font-bold uppercase tracking-[0.4em] text-text-dark/20">
              <ShieldCheck className="w-4 h-4 text-gold/20" />
              <span>Divine Privacy</span>
            </div>
            <div className="flex items-center gap-4 text-[8px] font-bold uppercase tracking-[0.4em] text-text-dark/20">
              <Sparkles className="w-4 h-4 text-gold/20" />
              <span>Frequency Aligned</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE: REFINED RITUAL BOOKING CARD (Extra Soft) */}
        <div className="lg:col-span-4 lg:col-start-9 relative hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.99, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 3.5, ease: [0.22, 1, 0.36, 1], delay: 1 }}
          >
            {/* Breathing Motion Wrapper */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Glassmorphic Panel - Maximum Softness */}
              <div className="glass rounded-[4rem] p-12 space-y-10 border-white/10 shadow-luxury bg-white/[0.08] backdrop-blur-[100px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />
                
                <div className="space-y-5 relative z-10">
                  <div className="flex items-center gap-3">
                    <Moon className="w-3.5 h-3.5 text-gold/50" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-gold/50">Ritual Intake</p>
                  </div>
                  <h3 className="font-display text-4xl text-text-dark leading-[1.2] tracking-tight">Your <br />Sacred <br />Session</h3>
                </div>

                <div className="space-y-8 relative z-10">
                  {[
                    { icon: Calendar, text: 'Select Your Moment', sub: 'Honoring your frequency' },
                    { icon: Heart, text: 'Somatic Focus', sub: 'Where healing begins' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 group/item">
                      <div className="w-12 h-12 rounded-full bg-cream/30 flex items-center justify-center text-gold border border-gold/5 transition-all duration-1000 group-hover/item:border-gold/15 group-hover/item:scale-105">
                        <item.icon className="w-5 h-5 stroke-[1.1]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-dark/60">{item.text}</p>
                        <p className="text-[10px] text-text-dark/25 italic font-light">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={openBooking}
                  className="w-full py-5.5 bg-text-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-gold transition-all duration-1000 shadow-xl relative z-10 overflow-hidden"
                >
                  <span className="relative z-10">Enter Sanctuary</span>
                  <div className="absolute inset-0 bg-white/5 translate-y-full hover:translate-y-0 transition-transform duration-1000" />
                </button>
              </div>

              {/* Decorative Texture Only (1%) */}
              <div className="absolute -bottom-16 -left-16 w-64 h-64 border border-gold/[0.01] rounded-full mix-blend-overlay pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-48 h-48 border border-gold/[0.01] rounded-full mix-blend-overlay pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* ATMOSPHERIC DEPTH TRANSITION */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream via-cream/60 to-transparent pointer-events-none z-20" />
      
    </section>
  );
}