import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { Testimonial } from '../../types/cms';

export default function Testimonials() {
  const [contentReviews, setContentReviews] = useState<Testimonial[]>([]);

  useEffect(() => {
    cmsService.getTestimonials()
      .then(data => {
        const mapped = data.map(t => ({
          name: t.client_name || (t as any).name,
          role: t.program || (t as any).role,
          quote: t.review_text || (t as any).quote,
          rating: t.rating,
          is_featured: t.is_featured
        }));
        setContentReviews(mapped as any[]);
      })
      .catch(err => console.error('Failed to load testimonials:', err));
  }, []);

  const fallbackReviews = [
    {
      name: "Elena S.",
      role: "Somatic Breathwork Client",
      quote: "Lumaflow changed my relationship with my own body. I finally feel at home in my own skin. The breathwork sessions are a sacred hour of pure, unfiltered return.",
      rating: 5,
      is_featured: false
    },
    {
      name: "Julian M.",
      role: "Private Practice Integration",
      quote: "Walking into these sessions feels like leaving the weight of the world at the door. Alanna creates a container of unmatched safety, light, and grace.",
      rating: 5,
      is_featured: true
    },
    {
      name: "Sophia R.",
      role: "Deep Meditation Immersion",
      quote: "A profound shift in my nervous system. After months of chronic stress, Lumaflow helped me locate a well of deep stillness I didn't know I still possessed.",
      rating: 5,
      is_featured: false
    }
  ];

  const reviewsToRender = contentReviews.length > 0 ? contentReviews : fallbackReviews;

  return (
    <>
      <div className="section-transition" />
      <section className="py-44 bg-transparent relative overflow-hidden section-fade-top section-fade-bottom">
        
        {/* Soft Background Glows */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] ambient-glow-gold opacity-60 select-none pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[35vw] h-[35vw] ambient-glow-white opacity-40 select-none pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-36"
          >
            <span className="text-[#CBAE73] text-[10px] font-bold tracking-[0.4em] uppercase mb-4 block animate-glow">Testimonials</span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-text-dark font-light">
              Stories of <span className="italic text-[#CBAE73]">Transformation</span>
            </h2>
            <div className="w-12 h-[1px] bg-[#CBAE73]/30 mx-auto mt-6" />
          </motion.div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-stretch">
            {reviewsToRender.map((review, index) => {
              const isFeatured = review.is_featured;
              
              return (
                <motion.div
                  key={review.name + index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 2.0, delay: index * 0.25, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8 }}
                  className={`p-12 sm:p-14 rounded-[3rem] flex flex-col justify-between relative group transition-all duration-[800ms] backdrop-blur-md ${
                    isFeatured 
                      ? "bg-[#FAF8F5]/95 border-2 border-[#CBAE73]/45 shadow-[0_20px_50px_rgba(203,174,115,0.18)] hover:border-[#CBAE73]/70 hover:shadow-[0_30px_70px_rgba(203,174,115,0.3)]" 
                      : "bg-[#FAF8F5]/85 border border-[#CBAE73]/15 hover:bg-white/95 hover:border-[#CBAE73]/30 hover:shadow-[0_25px_60px_rgba(203,174,115,0.12)]"
                  }`}
                >
                  {/* Luxury Featured Study Badge */}
                  {isFeatured && (
                    <div className="absolute -top-4 right-10 px-4 py-1.5 bg-[#CBAE73] text-black text-[9px] font-bold uppercase tracking-[0.25em] rounded-full shadow-[0_4px_12px_rgba(203,174,115,0.35)] animate-glow">
                      Featured Study
                    </div>
                  )}

                  {/* Floating soft gold blur inside review card */}
                  <div className="w-full h-full absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle,rgba(203,174,115,0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                  <div className="space-y-8 relative z-10 flex-grow flex flex-col justify-start">
                    {/* Rating Stars & Quote Icon */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 text-[#CBAE73] fill-[#CBAE73] ${isFeatured ? "drop-shadow-[0_0_8px_rgba(203,174,115,0.6)] animate-glow" : "drop-shadow-[0_0_6px_rgba(203,174,115,0.35)]"}`} />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-[#CBAE73]/20 group-hover:text-[#CBAE73]/40 transition-colors duration-500 stroke-[1.2]" />
                    </div>

                    {/* Review Text - Absolute Readability */}
                    <p className="font-display text-xl sm:text-2xl text-text-dark/85 italic leading-relaxed group-hover:text-text-dark transition-colors duration-500 font-light mt-4 flex-grow">
                      "{review.quote}"
                    </p>
                  </div>

                  {/* Reviewer Details */}
                  <div className="pt-10 border-t border-gold/10 flex flex-col mt-8 relative z-10">
                    <span className="text-text-dark font-semibold tracking-wide text-base">
                      {review.name}
                    </span>
                    <span className="text-[#CBAE73] text-[10px] font-bold uppercase tracking-[0.2em] mt-1 block">
                      {review.role}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}
