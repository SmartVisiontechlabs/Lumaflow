import { motion } from 'framer-motion';

export default function AboutMe() {
  return (
    <>
      <div className="section-transition" />
      <section className="py-48 bg-[#F8F5F0] relative overflow-hidden section-fade-top section-fade-bottom">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            
            {/* LEFT: Founder Image (Alanna) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full aspect-[4/5] md:max-w-lg mx-auto lg:mx-0 group"
            >
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-[#CBAE73]/10 blur-[100px] rounded-full scale-90" />
              
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-transform duration-700 hover:scale-[1.01]">
                <img 
                  src="/alanna-new.jpeg" 
                  alt="Alanna - Founder of Lumaflow" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </motion.div>

            {/* RIGHT: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col space-y-12"
            >
              <div className="space-y-6">
                <span className="text-[#CBAE73] text-[10px] font-bold tracking-[0.4em] uppercase">
                  THE HEART BEHIND LUMAFLOW
                </span>
                <h2 className="font-display text-5xl md:text-7xl text-[#3A3A3A] font-light leading-tight">
                  Meet Alanna
                </h2>
                {/* Gold Divider */}
                <div className="w-16 h-[1.5px] bg-[#CBAE73]/40" />
              </div>
              
              <div className="space-y-10">
                <p className="font-display text-2xl md:text-3xl text-[#3A3A3A] leading-relaxed italic opacity-90 font-light">
                  "I created Lumaflow as a space where you don’t have to fix yourself — only remember who you are."
                </p>
                
                <p className="text-lg text-[#3A3A3A]/60 font-body font-light leading-relaxed max-w-xl">
                  Alanna is a somatic practitioner and guide devoted to helping you reconnect with your natural state of calm through breath, movement, and awareness.
                </p>
              </div>

              <div className="pt-8">
                <button className="px-12 py-5 bg-[#CBAE73] text-black rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(203,174,115,0.25)] hover:scale-105 transition-all duration-500">
                  Begin Your Journey
                </button>
              </div>
            </motion.div>

          </div>
        </div>
        
        {/* Soft background elements */}
        <div className="absolute top-1/4 right-[-10%] w-[40vw] h-[40vw] bg-white/40 blur-[120px] rounded-full animate-soft-pulse pointer-events-none" />
      </section>
    </>
  );
}
