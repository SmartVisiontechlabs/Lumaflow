import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { cmsService } from '../../services/cmsService';
import { AboutAlanna } from '../../types/cms';

export default function AboutMe() {
  const openBooking = useBookingStore(state => state.openBooking);
  const [content, setContent] = useState<AboutAlanna | null>(null);

  useEffect(() => {
    cmsService.getAboutAlanna()
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load dynamic bio content:', err));
  }, []);

  const aboutData = content || {
    photo_url: '/alanna-new.jpeg',
    bio_title: 'Meet Alanna',
    quote: 'I created Lumaflow as a space where you don’t have to fix yourself — only remember who you are.',
    bio_body: 'Alanna is a somatic practitioner and guide devoted to helping you reconnect with your natural state of calm through breath, movement, and awareness.',
    credentials: ['Certified Somatic & Breathwork Facilitator', '1,200+ Hours of Held Container Space'],
    cta_label: 'Begin Your Journey',
    cta_link: '/book'
  };

  return (
    <>
      <div className="section-transition" />
      <section className="py-48 bg-transparent relative overflow-hidden section-fade-top section-fade-bottom">
        
        {/* Soft morning sun ray & glow behind section */}
        <div className="absolute inset-0 sun-beam-ray opacity-[0.02] pointer-events-none" />
        <div className="absolute top-[20%] left-[-10%] w-[45vw] h-[45vw] ambient-glow-gold opacity-[0.05] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            
            {/* LEFT: Founder Image (Alanna) with Double Luxury Gold Framing */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full aspect-[4/5] md:max-w-lg mx-auto lg:mx-0 group p-4 border border-[#CBAE73]/20 rounded-[32px] bg-white/5 backdrop-blur-[1px] hover:border-[#CBAE73]/40 transition-all duration-[1000ms]"
            >
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-[#CBAE73]/15 blur-[100px] rounded-full scale-90 select-none pointer-events-none" />
              
              {/* Inner dashed frame */}
              <div className="w-full h-full p-2 border border-dashed border-[#CBAE73]/25 rounded-[24px] flex items-center justify-center">
                {/* Main image container */}
                <div className="relative w-full h-full rounded-[18px] overflow-hidden shadow-[0_25px_65px_rgba(58,58,58,0.1)] transition-transform duration-[1200ms] ease-[0.22,1,0.36,1] group-hover:scale-[1.015]">
                  <img 
                    src={aboutData.photo_url || '/alanna-new.jpeg'} 
                    alt="Alanna - Founder of Lumaflow" 
                    className="w-full h-full object-cover object-center scale-[1.03] group-hover:scale-100 transition-transform duration-[1500ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3A3A3A]/10 to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col space-y-12"
            >
              <div className="space-y-6">
                <span className="text-[#CBAE73] text-[10px] font-bold tracking-[0.4em] uppercase mb-2 block animate-glow">
                  THE HEART BEHIND LUMAFLOW
                </span>
                <h2 className="font-display text-5xl md:text-7xl text-[#3A3A3A] font-light leading-tight">
                  {aboutData.bio_title}
                </h2>
                {/* Gold Divider */}
                <div className="w-16 h-[1.5px] bg-[#CBAE73]/40" />
              </div>
              
              <div className="space-y-8">
                {aboutData.quote && (
                  <p className="font-display text-2xl md:text-3xl text-[#3A3A3A] leading-relaxed italic opacity-95 font-light">
                    "{aboutData.quote}"
                  </p>
                )}
                
                <p className="text-lg text-[#3A3A3A]/85 font-body font-light leading-relaxed max-w-xl">
                  {aboutData.bio_body}
                </p>

                {/* Somatic Facilitation Credentials Trust Bar */}
                {aboutData.credentials && aboutData.credentials.length > 0 && (
                  <div className="pt-6 border-t border-[#CBAE73]/20 flex items-start space-x-3 max-w-xl">
                    <div className="w-2 h-2 rounded-full bg-[#CBAE73] mt-1.5 flex-shrink-0 animate-glow" />
                    <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#3A3A3A]/75 leading-relaxed">
                      {aboutData.credentials.join(' • ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => openBooking()}
                  className="px-12 py-5 bg-[#CBAE73] text-black rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(203,174,115,0.2)] hover:shadow-[0_20px_40px_rgba(203,174,115,0.35)] hover:scale-[1.03] hover:bg-[#DBC088] transition-all duration-[600ms] cursor-pointer"
                >
                  {aboutData.cta_label}
                </button>
              </div>
            </motion.div>

          </div>
        </div>
        
        {/* Soft background elements */}
        <div className="absolute top-1/4 right-[-10%] w-[40vw] h-[40vw] bg-white/40 blur-[120px] rounded-full pointer-events-none select-none" />
      </section>
    </>
  );
}
