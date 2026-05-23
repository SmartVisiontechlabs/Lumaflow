import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCmsStore } from '../../store/cmsStore';

export default function Quote() {
  const quotes = useCmsStore(state => state.quotes);
  const isLoading = useCmsStore(state => state.isLoading);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle through all CMS quotes every 8 seconds
  useEffect(() => {
    if (quotes.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  // Reset to 0 if quotes change (e.g. after CMS save)
  useEffect(() => {
    setActiveIndex(0);
  }, [quotes.length]);

  const activeQuote = quotes[activeIndex];
  const quote_text = activeQuote?.quote || activeQuote?.quote_text || '';
  const author_text = activeQuote?.author || activeQuote?.author_text || 'Client Reflection';

  if (!isLoading && quotes.length === 0) {
    return null;
  }

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
        className="max-w-5xl mx-auto flex flex-col items-center relative z-10 w-full"
      >
        {/* Delicate Gold-faded Vertical Accent Line at the top */}
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: 60 }}
          viewport={{ once: true }}
          transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
          className="w-[1px] bg-gradient-to-b from-transparent via-[#CBAE73]/50 to-transparent mb-12"
        />

        {isLoading || quotes.length === 0 ? (
          <div className="space-y-6 flex flex-col items-center w-full max-w-2xl animate-pulse">
            <div className="h-2.5 w-36 bg-gold/15 rounded" />
            <div className="h-10 w-full bg-gold/10 rounded" />
            <div className="h-10 w-4/5 bg-gold/10 rounded" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              {/* Author label */}
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#CBAE73]/70 mb-10 font-body animate-glow">
                {author_text}
              </span>

              <blockquote className="font-display text-4xl sm:text-5xl md:text-6xl italic leading-[1.6] text-text-dark/90 font-light tracking-wide max-w-4xl px-4">
                "{quote_text}"
              </blockquote>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Dot navigation — shows only if multiple quotes */}
        {!isLoading && quotes.length > 1 && (
          <div className="flex items-center gap-2.5 mt-16">
            {quotes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`rounded-full transition-all duration-700 cursor-pointer ${
                  idx === activeIndex
                    ? 'w-6 h-[3px] bg-[#CBAE73]'
                    : 'w-[3px] h-[3px] bg-[#CBAE73]/30 hover:bg-[#CBAE73]/60'
                }`}
              />
            ))}
          </div>
        )}
        
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
