import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cmsService } from '../../services/cmsService';
import { Quote as QuoteType } from '../../types/cms';

export default function Quote() {
  const [quotes, setQuotes] = useState<QuoteType[]>([]);

  useEffect(() => {
    cmsService.getQuotes()
      .then(data => setQuotes(data))
      .catch(err => console.error('Failed to load quotes:', err));
  }, []);

  const quoteData = quotes.length > 0 ? {
    quote_text: quotes[0].quote,
    author_text: quotes[0].author
  } : {
    quote_text: 'Transforming negative energy into love and light.',
    author_text: 'Client Reflection'
  };

  return (
    <section className="py-80 px-8 bg-transparent flex items-center justify-center text-center overflow-hidden relative">
      
      {/* Background Soft Luminous Glow - Walking into healing light */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] h-[55vh] bg-[radial-gradient(circle,rgba(253,244,215,0.85)_0%,rgba(203,174,115,0.14)_35%,transparent_65%)] blur-[90px]" />
        <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] ambient-glow-gold opacity-[0.03]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, filter: 'blur(12px)', y: 30 }}
        whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto flex flex-col items-center relative z-10"
      >
        {/* Delicate Gold-faded Vertical Accent Line at the top */}
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: 60 }}
          viewport={{ once: true }}
          transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
          className="w-[1px] bg-gradient-to-b from-transparent via-[#CBAE73]/50 to-transparent mb-12"
        />

        {/* Decorative Quote Icon or Marker */}
        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#CBAE73]/70 mb-10 font-body animate-glow">
          {quoteData.author_text || 'Client Reflection'}
        </span>

        <blockquote className="font-display text-4xl sm:text-5xl md:text-6xl italic leading-[1.6] text-text-dark/90 font-light tracking-wide max-w-4xl px-4">
          “{quoteData.quote_text}”
        </blockquote>
        
        {/* Minimal Luxury Divider Thread at the bottom */}
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: 60 }}
          viewport={{ once: true }}
          transition={{ duration: 2.0, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-[1px] bg-gradient-to-b from-[#CBAE73]/50 to-transparent mt-16"
        />
      </motion.div>
    </section>
  );
}
