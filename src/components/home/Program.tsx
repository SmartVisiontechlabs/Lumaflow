import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import { cmsService } from '../../services/cmsService';
import { HealingPath } from '../../types/cms';

export default function Program() {
  const openBooking = useBookingStore(state => state.openBooking);
  const navigate = useNavigate();
  const [contentPaths, setContentPaths] = useState<HealingPath[]>([]);

  useEffect(() => {
    cmsService.getHealingPaths()
      .then(data => {
        const mapped = data.map(p => ({
          ...p,
          benefit: p.description || (p as any).benefit,
        }));
        setContentPaths(mapped as any[]);
      })
      .catch(err => console.error('Failed to load healing paths:', err));
  }, []);

  const fallbackPrograms = [
    {
      title: "Breathwork",
      benefit: "Release held tension and emotional heaviness.",
    },
    {
      title: "Somatic Flow",
      benefit: "Reconnect body awareness and nervous system ease.",
    },
    {
      title: "Deep Meditation",
      benefit: "Anchor into profound stillness and inner quiet.",
    }
  ];

  const programsToRender = contentPaths.length > 0 ? contentPaths : fallbackPrograms;

  const handleProgramClick = (title: string) => {
    openBooking(null, { journeyType: title, entrySource: 'offering' });
    navigate('/book');
  };

  return (
    <section className="py-48 bg-transparent relative section-fade-top section-fade-bottom">
      
      {/* Luminous atmosphere element */}
      <div className="absolute top-[20%] right-[-15%] w-[45vw] h-[45vw] ambient-glow-gold opacity-[0.03] select-none pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-32"
        >
          <span className="text-[#CBAE73] text-[10px] font-bold tracking-[0.4em] uppercase mb-4 block animate-glow">Our Offerings</span>
          <h2 className="font-display text-5xl md:text-6xl text-text-dark font-light">
            Journeys to <span className="italic text-[#CBAE73]">inner calm</span>
          </h2>
          <div className="w-12 h-[1px] bg-[#CBAE73]/30 mx-auto mt-6" />
        </motion.div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {programsToRender.map((program, index) => (
            <motion.div
              key={program.title + index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 2.0, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              onClick={() => handleProgramClick(program.title)}
              className="p-16 rounded-[3rem] bg-[#FAF8F5]/85 border border-[#CBAE73]/15 flex flex-col items-center text-center group cursor-pointer transition-all duration-[800ms] hover:bg-white/95 hover:border-[#CBAE73]/35 hover:shadow-[0_35px_80px_rgba(203,174,115,0.12)] relative animate-fadeIn"
            >
              {/* Floating soft gold blur inside card */}
              <div className="w-full h-full absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle,rgba(203,174,115,0.04),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              
              <h3 className="text-3xl font-display text-text-dark mb-6 group-hover:text-gold transition-colors duration-700 relative z-10 font-light">
                {program.title}
              </h3>
              
              {/* Absolute Readability text description */}
              <p className="text-text-dark/80 font-body font-light flex-grow leading-relaxed text-base relative z-10">
                {program.benefit}
              </p>

              {/* Delicate Gold Arrow Marker to guide the click direction */}
              <div className="mt-10 flex items-center justify-center gap-2 text-[#CBAE73] text-[10px] font-bold uppercase tracking-[0.25em] opacity-80 group-hover:opacity-100 transition-all duration-500 relative z-10">
                <span>Begin Journey</span>
                <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-500 text-sm leading-none">→</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Premium Program CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 2.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 flex justify-center"
        >
          <button 
            onClick={() => {
              openBooking();
              navigate('/book');
            }}
            className="px-14 py-6 bg-[#CBAE73] text-black rounded-full text-[11px] font-bold tracking-[0.4em] uppercase transition-all duration-[600ms] shadow-[0_15px_30px_rgba(203,174,115,0.2)] hover:shadow-[0_20px_40px_rgba(203,174,115,0.35)] hover:bg-[#DBC088] hover:scale-[1.03] active:scale-98 cursor-pointer flex items-center justify-center"
          >
            Explore Healing Paths
          </button>
        </motion.div>

      </div>
    </section>
  );
}

