"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar, Sparkles, Wind, Heart, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Step = 1 | 2 | 3 | 4;

const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

export default function ExperienceModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Prevent scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setSelectedEmotion(null);
        setSelectedSession(null);
        setSelectedTime(null);
      }, 400);
    }
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  const nextStep = () => setStep((s) => (s < 4 ? (s + 1) as Step : s));
  const prevStep = () => setStep((s) => (s > 1 ? (s - 1) as Step : s));

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] isolate flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* BACKDROP */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={transition}
            className="relative z-10 w-full max-w-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.35)] p-8 md:p-14 overflow-hidden border border-white/20"
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-2 text-[#3A3A3A]/30 hover:text-black transition-all z-20 hover:bg-[#F8F5F0] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="space-y-12"
                >
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.4em] text-[#CBAE73] uppercase mb-4 font-bold">Step 1 — Attunement</p>
                    <h2 className="text-4xl md:text-5xl font-display text-[#3A3A3A] mb-4 font-light">How are you feeling?</h2>
                    <p className="text-[#3A3A3A]/50 font-body font-light text-lg">Select the emotion that resonates most with your current state.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Stressed", "Heavy", "Disconnected"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setSelectedEmotion(item)}
                        className={`px-6 py-6 rounded-full border transition-all duration-500 text-[11px] font-bold tracking-[0.2em] uppercase ${
                          selectedEmotion === item
                            ? "bg-[#CBAE73] border-[#CBAE73] text-black shadow-2xl shadow-[#CBAE73]/30 scale-105"
                            : "border-[#3A3A3A]/5 text-[#3A3A3A]/60 bg-[#F8F5F0]/30 hover:border-[#CBAE73]/40 hover:bg-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center pt-8">
                    <button
                      disabled={!selectedEmotion}
                      onClick={nextStep}
                      className="px-16 py-5 rounded-full bg-[#3A3A3A] text-white text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all duration-500 disabled:opacity-20 disabled:hover:scale-100"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="space-y-10"
                >
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.4em] text-[#CBAE73] uppercase mb-4 font-bold">Step 2 — Experience</p>
                    <h2 className="text-4xl md:text-5xl font-display text-[#3A3A3A] mb-4 font-light">Choose your path</h2>
                    <p className="text-[#3A3A3A]/50 font-body font-light text-lg">Select the healing modality for your guided journey.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { name: "Breathwork", icon: <Wind className="w-5 h-5" />, desc: "Focus on conscious breathing to release mental tension." },
                      { name: "Somatic Flow", icon: <Heart className="w-5 h-5" />, desc: "Gently connect with your body's innate wisdom." },
                      { name: "Deep Meditation", icon: <Sparkles className="w-5 h-5" />, desc: "Anchor into profound, centered inner calm." },
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => setSelectedSession(item.name)}
                        className={`p-7 rounded-3xl border text-left transition-all duration-700 flex items-center gap-8 group ${
                          selectedSession === item.name
                            ? "bg-[#CBAE73]/10 border-[#CBAE73] shadow-[0_15px_40px_rgba(203,174,115,0.15)]"
                            : "border-[#3A3A3A]/5 bg-white hover:border-[#CBAE73]/30 hover:shadow-[0_0_30px_rgba(203,174,115,0.1)]"
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 ${
                          selectedSession === item.name ? "bg-[#CBAE73] text-black scale-110" : "bg-[#F8F5F0] text-[#CBAE73] group-hover:scale-110"
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-2xl font-display text-[#3A3A3A] mb-1">{item.name}</h3>
                          <p className="text-sm text-[#3A3A3A]/40 font-body font-light">{item.desc}</p>
                        </div>
                        {selectedSession === item.name && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <div className="w-6 h-6 bg-[#CBAE73] rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-black" />
                            </div>
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-8">
                    <button onClick={prevStep} className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#3A3A3A]/30 hover:text-black transition">Back</button>
                    <button
                      disabled={!selectedSession}
                      onClick={nextStep}
                      className="px-16 py-5 rounded-full bg-[#3A3A3A] text-white text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all duration-500 disabled:opacity-20"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="space-y-12"
                >
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.4em] text-[#CBAE73] uppercase mb-4 font-bold">Step 3 — Moment</p>
                    <h2 className="text-4xl md:text-5xl font-display text-[#3A3A3A] mb-4 font-light">Select a time</h2>
                    <p className="text-[#3A3A3A]/50 font-body font-light text-lg">Choose a quiet moment for your transformation.</p>
                  </div>

                  <div className="space-y-10">
                    <div className="flex items-center justify-between px-8 py-5 bg-[#F8F5F0]/50 rounded-2xl border border-[#3A3A3A]/5">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-4 h-4 text-[#CBAE73]" />
                        <span className="text-[11px] font-bold text-[#3A3A3A] uppercase tracking-[0.3em]">Wednesday, May 12</span>
                      </div>
                      <span className="text-[10px] text-[#CBAE73] font-black uppercase tracking-[0.4em]">Available Today</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "07:00 PM", "08:30 PM"].map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-5 rounded-2xl border text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                            selectedTime === time
                              ? "bg-[#3A3A3A] border-[#3A3A3A] text-white shadow-2xl scale-105"
                              : "border-[#3A3A3A]/5 text-[#3A3A3A]/40 bg-[#F8F5F0]/20 hover:border-[#CBAE73]/30 hover:text-[#CBAE73]"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-8">
                    <button onClick={prevStep} className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#3A3A3A]/30 hover:text-black transition">Back</button>
                    <button
                      disabled={!selectedTime}
                      onClick={nextStep}
                      className="px-16 py-5 rounded-full bg-[#CBAE73] text-black text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all duration-500 disabled:opacity-20"
                    >
                      Confirm Time
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="space-y-12"
                >
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.4em] text-[#CBAE73] uppercase mb-4 font-bold">The Journey Begins</p>
                    <h2 className="text-4xl md:text-5xl font-display text-[#3A3A3A] mb-4 font-light">Confirm your session</h2>
                    <p className="text-[#3A3A3A]/50 font-body font-light text-lg">A sacred space is being prepared for your arrival.</p>
                  </div>

                  <div className="bg-[#F8F5F0]/50 rounded-[2.5rem] p-12 border border-[#CBAE73]/10 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
                      <Sparkles className="w-40 h-40" />
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-[#3A3A3A]/5 pb-8">
                      <span className="text-[10px] text-[#3A3A3A]/30 uppercase tracking-[0.5em] font-bold">Feeling</span>
                      <span className="font-display text-3xl text-[#3A3A3A]">{selectedEmotion}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#3A3A3A]/5 pb-8">
                      <span className="text-[10px] text-[#3A3A3A]/30 uppercase tracking-[0.5em] font-bold">Journey</span>
                      <span className="font-display text-3xl text-[#3A3A3A]">{selectedSession}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-[#3A3A3A]/30 uppercase tracking-[0.5em] font-bold">Moment</span>
                      <div className="text-right">
                        <span className="font-display text-3xl text-[#3A3A3A] block">May 12</span>
                        <span className="text-xs text-[#CBAE73] font-black uppercase tracking-[0.3em]">{selectedTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-8">
                    <button
                      onClick={onClose}
                      className="w-full px-16 py-6 rounded-full bg-[#CBAE73] text-black text-[11px] font-bold uppercase tracking-[0.5em] shadow-[0_30px_60px_rgba(203,174,115,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-700"
                    >
                      Begin Your Journey
                    </button>
                    <button onClick={prevStep} className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#3A3A3A]/30 hover:text-black transition">
                      Wait, let me change something
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}