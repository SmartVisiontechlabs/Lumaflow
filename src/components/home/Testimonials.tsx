import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { useCmsStore } from '../../store/cmsStore';

// ─── Shared card interface ────────────────────────────────────────────────────
interface ReviewCard {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  is_featured: boolean;
}

// ─── Single luxury card ───────────────────────────────────────────────────────
function TestimonialCard({
  review,
  isCenter,
}: {
  review: ReviewCard;
  isCenter: boolean;
}) {
  return (
    <div
      className={`p-12 sm:p-14 rounded-[3rem] flex flex-col justify-between relative group backdrop-blur-md h-full transition-all duration-[800ms] ${
        isCenter
          ? 'bg-[#FAF8F5]/95 border-2 border-[#CBAE73]/45 shadow-[0_20px_60px_rgba(203,174,115,0.22)]'
          : 'bg-[#FAF8F5]/85 border border-[#CBAE73]/15 shadow-[0_8px_30px_rgba(203,174,115,0.08)]'
      }`}
    >
      {/* CMS-featured badge — only shown on the center card */}
      {review.is_featured && isCenter && (
        <div className="absolute -top-4 right-10 px-4 py-1.5 bg-[#CBAE73] text-black text-[9px] font-bold uppercase tracking-[0.25em] rounded-full shadow-[0_4px_12px_rgba(203,174,115,0.35)] animate-glow">
          Featured Study
        </div>
      )}

      {/* Hover inner glow */}
      <div className="w-full h-full absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle,rgba(203,174,115,0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      {/* Stars + quote */}
      <div className="space-y-6 sm:space-y-8 relative z-10 flex-grow flex flex-col justify-start">
        <div className="flex gap-1">
          {[...Array(review.rating)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 text-[#CBAE73] fill-[#CBAE73] ${
                isCenter
                  ? 'drop-shadow-[0_0_8px_rgba(203,174,115,0.6)] animate-glow'
                  : 'drop-shadow-[0_0_4px_rgba(203,174,115,0.3)]'
              }`}
            />
          ))}
        </div>

        <p
          className={`font-display italic leading-relaxed font-light flex-grow ${
            isCenter
              ? 'text-xl sm:text-2xl text-text-dark/85'
              : 'text-lg text-text-dark/65'
          }`}
        >
          "{review.quote}"
        </p>
      </div>

      {/* Author */}
      <div className="pt-8 border-t border-gold/10 mt-8 relative z-10">
        <p className="text-text-dark font-semibold tracking-wide text-sm">
          {review.name}
        </p>
        <p className="text-[#CBAE73] text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
          {review.role}
        </p>
      </div>
    </div>
  );
}

// ─── Section skeleton ─────────────────────────────────────────────────────────
function DesktopSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-8 animate-pulse">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`p-14 rounded-[3rem] bg-[#FAF8F5]/85 border border-[#CBAE73]/15 space-y-6 transition-all duration-700 ${
            i === 1 ? '' : 'scale-[0.95] opacity-70'
          }`}
          style={{ minHeight: 360 }}
        >
          <div className="flex gap-1">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="w-4 h-4 rounded-full bg-gold/10" />
            ))}
          </div>
          <div className="h-5 w-full bg-gold/10 rounded" />
          <div className="h-5 w-5/6 bg-gold/10 rounded" />
          <div className="h-5 w-4/6 bg-gold/10 rounded" />
        </div>
      ))}
    </div>
  );
}

function MobileSkeleton() {
  return (
    <div
      className="p-12 rounded-[3rem] bg-[#FAF8F5]/85 border border-[#CBAE73]/15 animate-pulse space-y-4"
      style={{ minHeight: 280 }}
    >
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 rounded-full bg-gold/10" />
        ))}
      </div>
      <div className="h-5 w-full bg-gold/10 rounded" />
      <div className="h-5 w-5/6 bg-gold/10 rounded" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Testimonials() {
  const testimonials = useCmsStore(state => state.testimonials);
  const isLoading = useCmsStore(state => state.isLoading);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number>(0);

  // Map raw Supabase/API rows → clean ReviewCard shape
  const reviews: ReviewCard[] = testimonials.map((t, i) => ({
    id: t.id || String(i),
    name: t.client_name || t.name || '',
    role: t.program || t.role || '',
    quote: t.review_text || t.quote || '',
    rating: t.rating || 5,
    is_featured: t.is_featured || false,
  }));

  const total = reviews.length;

  // Jump to the CMS-featured review when data loads / count changes
  useEffect(() => {
    const fi = reviews.findIndex(r => r.is_featured);
    setCurrentIndex(fi >= 0 ? fi : 0);
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goTo = useCallback(
    (idx: number, dir: number) => {
      setDirection(dir);
      setCurrentIndex(((idx % total) + total) % total);
    },
    [total]
  );

  const advance = useCallback(() => goTo(currentIndex + 1, 1), [currentIndex, goTo]);
  const retreat = useCallback(() => goTo(currentIndex - 1, -1), [currentIndex, goTo]);

  // ── Auto-slide (pauses on hover) ────────────────────────────────────────────
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const id = setInterval(advance, 5500);
    return () => clearInterval(id);
  }, [advance, total, isPaused]);

  if (!isLoading && total === 0) return null;

  // ── Compute which 3 review indices to show on desktop ──────────────────────
  const prevIdx = (currentIndex - 1 + total) % total;
  const nextIdx = (currentIndex + 1) % total;

  const desktopSlots =
    total >= 3
      ? [prevIdx, currentIndex, nextIdx]
      : total === 2
      ? [currentIndex, nextIdx]
      : [currentIndex];

  const centerSlot = Math.floor(desktopSlots.length / 2);

  const gridCls =
    total >= 3
      ? 'grid-cols-3 gap-8'
      : total === 2
      ? 'grid-cols-2 gap-8 max-w-3xl mx-auto'
      : 'grid-cols-1 max-w-xl mx-auto';

  // ── Touch / swipe support ──────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? advance() : retreat();
  };

  return (
    <>
      <div className="section-transition" />
      <section
        className="py-32 bg-transparent relative overflow-hidden section-fade-top section-fade-bottom"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Atmospheric glows */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] ambient-glow-gold opacity-60 select-none pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[35vw] h-[35vw] ambient-glow-white opacity-40 select-none pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 relative z-10">

          {/* ── Section Header ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-24"
          >
            <span className="text-[#CBAE73] text-[10px] font-bold tracking-[0.4em] uppercase mb-4 block animate-glow">
              Testimonials
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-text-dark font-light">
              Stories of <span className="italic text-[#CBAE73]">Transformation</span>
            </h2>
            <div className="w-12 h-[1px] bg-[#CBAE73]/30 mx-auto mt-6" />
          </motion.div>

          {/* ── DESKTOP: 3-card window (lg+) ───────────────────────────────── */}
          <div className="hidden lg:block">
            {isLoading ? (
              <DesktopSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: direction * 55, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: direction * -55, filter: 'blur(8px)' }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className={`grid items-stretch ${gridCls}`}
                >
                  {desktopSlots.map((idx, slotPos) => {
                    const isCenter = slotPos === centerSlot;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!isCenter) slotPos < centerSlot ? retreat() : advance();
                        }}
                        className={`transition-all duration-[800ms] ${
                          !isCenter
                            ? 'scale-[0.95] opacity-[0.72] cursor-pointer hover:opacity-[0.88]'
                            : ''
                        }`}
                      >
                        <TestimonialCard review={reviews[idx]} isCenter={isCenter} />
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* ── MOBILE: single card with swipe (< lg) ─────────────────────── */}
          <div className="lg:hidden">
            {isLoading ? (
              <MobileSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`mob-${currentIndex}`}
                  initial={{ opacity: 0, x: direction * 40, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: direction * -40, filter: 'blur(6px)' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TestimonialCard review={reviews[currentIndex]} isCenter />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* ── Navigation: dots + arrows ──────────────────────────────────── */}
          {!isLoading && total > 1 && (
            <div className="flex flex-col items-center gap-5 mt-16">

              {/* Pill-style dot indicators */}
              <div className="flex items-center gap-2.5">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx, idx > currentIndex ? 1 : -1)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    className={`rounded-full transition-all duration-700 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-8 h-[3px] bg-[#CBAE73] shadow-[0_0_8px_rgba(203,174,115,0.5)]'
                        : 'w-[3px] h-[3px] bg-[#CBAE73]/30 hover:bg-[#CBAE73]/60'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / counter / next */}
              <div className="flex items-center gap-5">
                <button
                  onClick={retreat}
                  aria-label="Previous testimonial"
                  className="w-11 h-11 rounded-full border border-[#CBAE73]/20 flex items-center justify-center text-[#CBAE73]/50 hover:border-[#CBAE73]/55 hover:text-[#CBAE73] transition-all duration-500 cursor-pointer"
                >
                  ←
                </button>
                <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-text-dark/20 min-w-[44px] text-center">
                  {currentIndex + 1} / {total}
                </span>
                <button
                  onClick={advance}
                  aria-label="Next testimonial"
                  className="w-11 h-11 rounded-full border border-[#CBAE73]/20 flex items-center justify-center text-[#CBAE73]/50 hover:border-[#CBAE73]/55 hover:text-[#CBAE73] transition-all duration-500 cursor-pointer"
                >
                  →
                </button>
              </div>

            </div>
          )}

        </div>
      </section>
    </>
  );
}
