import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Heart } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import SEOMetadata from '../components/seo/SEOMetadata';

export default function Contact() {
  const [pageConfig, setPageConfig] = useState<any>(null);

  useEffect(() => {
    let active = true;
    cmsService.getPagesContent()
      .then(data => {
        if (active && data?.contact) {
          setPageConfig(data.contact);
        }
      })
      .catch(err => {
        console.error('Failed to load Contact Page CMS config:', err);
      });
    return () => { active = false; };
  }, []);

  const defaultTrust = [
    "Typically responds within 24 hours",
    "100+ healing journeys supported",
    "Private & confidential"
  ];

  const trustDetails = pageConfig?.trust_details || defaultTrust;

  const getTrustIcon = (idx: number) => {
    switch (idx) {
      case 0: return <Clock className="w-4 h-4 text-[#CBAE73]" />;
      case 1: return <Heart className="w-4 h-4 text-[#CBAE73]" />;
      case 2:
      default:
        return <ShieldCheck className="w-4 h-4 text-[#CBAE73]" />;
    }
  };

  return (
    <div className="pt-36 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <SEOMetadata />
      <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* LEFT: FORM SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-10"
        >
          <div className="space-y-6">
            <h1 className="font-display text-5xl md:text-7xl text-[#3A3A3A] leading-tight">
              {pageConfig?.hero_title ? (
                pageConfig.hero_title.split(pageConfig.hero_title.includes('\\n') ? '\\n' : '\n').map((line: string, i: number, arr: string[]) => (
                  <React.Fragment key={i}>
                    {i === 1 ? <span className="italic text-[#CBAE73]">{line}</span> : line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))
              ) : (
                <>Begin your conversation <br /><span className="italic text-[#CBAE73]">with stillness</span></>
              )}
            </h1>
            <p className="text-xl text-[#3A3A3A]/60 font-light max-w-lg leading-relaxed">
              {pageConfig?.hero_subtitle || "We’re here to support you — gently, thoughtfully, at your pace."}
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(203,174,115,0.15)] border border-white/40 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-[10px] text-[#CBAE73] font-bold uppercase tracking-[0.4em]">{pageConfig?.form_title || "Inquiry"}</p>
              <p className="text-sm text-[#3A3A3A]/50 font-light italic">{pageConfig?.form_microcopy || `"Take a moment. Breathe. Then share what’s on your heart."`}</p>
            </div>

            <form className="space-y-6" onSubmit={e => e.preventDefault()}>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="What should we call you?" 
                  className="w-full px-8 py-5 bg-[#F8F5F0]/50 border border-[#3A3A3A]/5 rounded-full focus:outline-none focus:border-[#CBAE73]/50 focus:bg-white transition-all text-sm font-light tracking-wide" 
                />
                <input 
                  type="email" 
                  placeholder="Where can we reach you?" 
                  className="w-full px-8 py-5 bg-[#F8F5F0]/50 border border-[#3A3A3A]/5 rounded-full focus:outline-none focus:border-[#CBAE73]/50 focus:bg-white transition-all text-sm font-light tracking-wide" 
                />
                <textarea 
                  placeholder="Share what’s on your heart..." 
                  rows={5} 
                  className="w-full px-8 py-6 bg-[#F8F5F0]/50 border border-[#3A3A3A]/5 rounded-[2rem] focus:outline-none focus:border-[#CBAE73]/50 focus:bg-white transition-all text-sm font-light tracking-wide resize-none"
                ></textarea>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#CBAE73] text-black w-full py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] shadow-[0_15px_30px_rgba(203,174,115,0.3)] hover:shadow-[0_20px_40px_rgba(203,174,115,0.45)] transition-all duration-500 cursor-pointer"
              >
                {pageConfig?.button_text || "Reach Out Gently"}
              </motion.button>
            </form>

            {/* TRUST SECTION */}
            <div className="pt-8 border-t border-[#3A3A3A]/5 grid grid-cols-1 gap-4">
              {trustDetails.map((detail: string, dIdx: number) => (
                <div key={dIdx} className="flex items-center gap-3 text-[10px] text-[#3A3A3A]/40 font-bold uppercase tracking-[0.2em]">
                  {getTrustIcon(dIdx)}
                  {detail}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT: IMAGE SECTION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[700px] hidden md:block group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/40 via-transparent to-transparent z-10 rounded-[3rem]" />
          
          <motion.img 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            src={pageConfig?.image_url || "/contact-image.jpg"} 
            alt="Contact Lumaflow Sanctuary" 
            className="w-full h-full object-cover rounded-[3rem] shadow-luxury" 
          />

          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <p className="font-display text-3xl text-white italic text-center px-12 drop-shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
              {pageConfig?.right_quote || `"You don’t have to do this alone."`}
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
