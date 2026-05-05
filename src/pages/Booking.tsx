import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, Heart, Sparkles, Calendar, Clock, 
  ChevronRight, ChevronLeft, CheckCircle2, 
  CreditCard, ShieldCheck, Star, ArrowRight 
} from 'lucide-react';

type BookingState = {
  emotion: string;
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
};

const steps = [
  "Emotion",
  "Service",
  "Schedule",
  "Details",
  "Review",
  "Payment",
  "Success"
];

const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const transition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};

export default function Booking() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BookingState>({
    emotion: '',
    service: '',
    date: '',
    time: '',
    name: '',
    email: '',
  });

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const services = [
    { name: "Breathwork", desc: "Regulate your nervous system through conscious breathing.", icon: <Wind className="w-6 h-6" /> },
    { name: "Somatic Flow", desc: "Connect with your body's wisdom through mindful movement.", icon: <Heart className="w-6 h-6" /> },
    { name: "Meditation", desc: "Anchor into stillness and profound inner peace.", icon: <Sparkles className="w-6 h-6" /> },
  ];

  const timeSlots = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "07:00 PM"];

  // Progress percentage
  const progress = ((step) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#F8F5F0] pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[100vw] bg-white rounded-full blur-[150px] opacity-40 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Progress Bar */}
        {step < 6 && (
          <div className="mb-16 space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#CBAE73]">Step {step} — {steps[step]}</p>
              <p className="text-[10px] font-bold text-[#3A3A3A]/40 uppercase tracking-[0.2em]">{Math.round(progress)}% Complete</p>
            </div>
            <div className="h-[2px] w-full bg-[#3A3A3A]/5 overflow-hidden rounded-full">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-[#CBAE73]"
                transition={{ duration: 1, ease: "circOut" }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" {...variants} transition={transition} className="space-y-12 text-center">
              <div className="space-y-4">
                <h1 className="font-display text-5xl md:text-7xl text-[#3A3A3A]">How are you feeling today?</h1>
                <p className="text-[#3A3A3A]/50 font-light italic text-lg">"Take a moment. Breathe. Meet yourself where you are."</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["Stressed", "Heavy", "Disconnected"].map((e) => (
                  <button
                    key={e}
                    onClick={() => { setData({...data, emotion: e}); next(); }}
                    className={`p-10 rounded-[2rem] border transition-all duration-700 uppercase text-[11px] font-bold tracking-[0.3em] ${
                      data.emotion === e 
                      ? 'bg-[#CBAE73] border-[#CBAE73] text-black shadow-luxury' 
                      : 'bg-white border-[#3A3A3A]/5 text-[#3A3A3A]/60 hover:border-[#CBAE73]/40'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" {...variants} transition={transition} className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="font-display text-5xl text-[#3A3A3A]">Choose your practice</h2>
                <p className="text-[#3A3A3A]/50 font-light text-lg">Select the healing modality for your journey.</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {services.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setData({...data, service: s.name})}
                    className={`p-8 rounded-[2rem] border text-left flex items-center gap-8 transition-all duration-700 group ${
                      data.service === s.name 
                      ? 'bg-white border-[#CBAE73] shadow-luxury scale-[1.02]' 
                      : 'bg-white/50 border-[#3A3A3A]/5 hover:border-[#CBAE73]/30 hover:bg-white'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 ${
                      data.service === s.name ? 'bg-[#CBAE73] text-black' : 'bg-[#F8F5F0] text-[#CBAE73]'
                    }`}>
                      {s.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-display text-2xl text-[#3A3A3A] mb-1">{s.name}</h3>
                      <p className="text-[#3A3A3A]/40 text-sm font-light">{s.desc}</p>
                    </div>
                    {data.service === s.name && <CheckCircle2 className="text-[#CBAE73] w-6 h-6" />}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-8">
                <button onClick={back} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#3A3A3A]/40 hover:text-black transition">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  disabled={!data.service}
                  onClick={next}
                  className="px-12 py-5 bg-[#3A3A3A] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all duration-500 disabled:opacity-20"
                >
                  Continue <ChevronRight className="inline-block w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...variants} transition={transition} className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="font-display text-5xl text-[#3A3A3A]">Select your moment</h2>
                <p className="text-[#3A3A3A]/50 font-light text-lg italic">"A sacred space is being prepared for your arrival."</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-12 rounded-[2.5rem] shadow-luxury border border-[#3A3A3A]/5">
                {/* Minimal Calendar Mock */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-[#3A3A3A]/5">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#3A3A3A]">May 2026</p>
                    <div className="flex gap-4">
                      <ChevronLeft className="w-4 h-4 text-[#3A3A3A]/30 cursor-pointer" />
                      <ChevronRight className="w-4 h-4 text-[#3A3A3A]/30 cursor-pointer" />
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-4 text-center">
                    {["S", "M", "T", "W", "T", "F", "S"].map(d => <span key={d} className="text-[10px] font-bold text-[#3A3A3A]/20">{d}</span>)}
                    {[...Array(31)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setData({...data, date: `May ${i + 1}`})}
                        className={`w-10 h-10 rounded-full text-xs transition-all duration-500 ${
                          data.date === `May ${i + 1}`
                          ? 'bg-[#CBAE73] text-black font-bold shadow-lg'
                          : 'hover:bg-[#F8F5F0] text-[#3A3A3A]'
                        } ${i + 1 === 12 ? 'ring-1 ring-[#CBAE73] ring-offset-2' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-8">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#3A3A3A]/50 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Available Times
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {timeSlots.map(t => (
                      <button
                        key={t}
                        onClick={() => setData({...data, time: t})}
                        className={`py-4 rounded-xl border text-[11px] font-bold transition-all duration-500 ${
                          data.time === t
                          ? 'bg-[#3A3A3A] border-[#3A3A3A] text-white shadow-xl'
                          : 'border-[#3A3A3A]/5 text-[#3A3A3A]/60 hover:border-[#CBAE73]/40'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {data.date && data.time && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-6 bg-[#CBAE73]/5 rounded-2xl border border-[#CBAE73]/20">
                  <p className="text-sm text-[#CBAE73] font-bold uppercase tracking-[0.1em]">
                    You selected: {data.date} at {data.time}
                  </p>
                </motion.div>
              )}

              <div className="flex justify-between items-center pt-8">
                <button onClick={back} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#3A3A3A]/40 hover:text-black transition">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  disabled={!data.date || !data.time}
                  onClick={next}
                  className="px-12 py-5 bg-[#3A3A3A] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all duration-500 disabled:opacity-20"
                >
                  Confirm Time
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" {...variants} transition={transition} className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="font-display text-5xl text-[#3A3A3A]">Personal details</h2>
                <p className="text-[#3A3A3A]/50 font-light text-lg">Tell us a bit about yourself.</p>
              </div>
              <div className="max-w-lg mx-auto bg-white p-12 rounded-[2.5rem] shadow-luxury border border-[#3A3A3A]/5 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#3A3A3A]/40 ml-4">Full Name</label>
                  <input 
                    type="text" 
                    value={data.name}
                    onChange={(e) => setData({...data, name: e.target.value})}
                    placeholder="Alanna Smith"
                    className="w-full px-8 py-5 bg-[#F8F5F0]/50 border border-[#3A3A3A]/5 rounded-full focus:outline-none focus:border-[#CBAE73]/50 focus:bg-white transition-all text-sm font-light" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#3A3A3A]/40 ml-4">Email Address</label>
                  <input 
                    type="email" 
                    value={data.email}
                    onChange={(e) => setData({...data, email: e.target.value})}
                    placeholder="alanna@example.com"
                    className="w-full px-8 py-5 bg-[#F8F5F0]/50 border border-[#3A3A3A]/5 rounded-full focus:outline-none focus:border-[#CBAE73]/50 focus:bg-white transition-all text-sm font-light" 
                  />
                </div>
                <div className="flex items-center gap-3 pt-4 text-[10px] text-[#3A3A3A]/30 uppercase tracking-[0.1em] italic">
                  <ShieldCheck className="w-4 h-4 text-[#CBAE73]" /> Your data is sacred and remains private.
                </div>
              </div>
              <div className="flex justify-between items-center pt-8">
                <button onClick={back} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#3A3A3A]/40 hover:text-black transition">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  disabled={!data.name || !data.email}
                  onClick={next}
                  className="px-12 py-5 bg-[#3A3A3A] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all duration-500 disabled:opacity-20"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" {...variants} transition={transition} className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="font-display text-5xl text-[#3A3A3A]">Review your session</h2>
                <p className="text-[#3A3A3A]/50 font-light text-lg italic">"One final step before we begin."</p>
              </div>
              <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-luxury border border-[#3A3A3A]/5 overflow-hidden">
                <div className="p-12 space-y-8">
                  <div className="flex justify-between items-center border-b border-[#3A3A3A]/5 pb-6">
                    <span className="text-[10px] text-[#3A3A3A]/30 uppercase tracking-[0.4em] font-bold">Practice</span>
                    <span className="font-display text-2xl text-[#3A3A3A]">{data.service}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#3A3A3A]/5 pb-6">
                    <span className="text-[10px] text-[#3A3A3A]/30 uppercase tracking-[0.4em] font-bold">Moment</span>
                    <div className="text-right">
                      <span className="font-display text-2xl text-[#3A3A3A] block">{data.date}</span>
                      <span className="text-xs text-[#CBAE73] font-black uppercase tracking-[0.2em]">{data.time}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#3A3A3A]/30 uppercase tracking-[0.4em] font-bold">Guide</span>
                    <span className="font-display text-2xl text-[#3A3A3A]">Alanna</span>
                  </div>
                </div>
                <div className="bg-[#3A3A3A] p-12 flex justify-between items-center">
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Total Balance</p>
                    <p className="text-white font-display text-3xl">$120.00</p>
                  </div>
                  <button onClick={next} className="bg-[#CBAE73] text-black px-12 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all duration-700">
                    Confirm Session
                  </button>
                </div>
              </div>
              <button onClick={back} className="block mx-auto text-[10px] font-bold uppercase tracking-[0.3em] text-[#3A3A3A]/40 hover:text-black transition">
                Wait, I need to change something
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" {...variants} transition={transition} className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="font-display text-5xl text-[#3A3A3A]">Secured payment</h2>
                <p className="text-[#3A3A3A]/50 font-light text-lg">Secure your spot in the sanctuary.</p>
              </div>
              <div className="max-w-md mx-auto space-y-8">
                {/* Mock Card */}
                <div className="relative aspect-[1.6/1] w-full bg-gradient-to-br from-[#3A3A3A] to-[#1A1A1A] rounded-2xl p-8 text-white shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Sparkles className="w-32 h-32" />
                  </div>
                  <div className="h-full flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start">
                      <CreditCard className="w-10 h-10 text-[#CBAE73]" />
                      <p className="text-xs uppercase tracking-widest font-light opacity-50">Lumaflow Card</p>
                    </div>
                    <div>
                      <p className="text-2xl tracking-[0.2em] font-light mb-4 text-[#CBAE73]">•••• •••• •••• 4242</p>
                      <div className="flex justify-between items-end">
                        <p className="text-xs uppercase tracking-widest font-bold">{data.name || "YOUR NAME"}</p>
                        <p className="text-xs font-light opacity-50">12 / 28</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-[#3A3A3A]/5">
                    <div className="w-10 h-10 bg-[#F8F5F0] rounded-full flex items-center justify-center text-[#CBAE73]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#3A3A3A] uppercase tracking-wider">Instant Confirmation</p>
                      <p className="text-[10px] text-[#3A3A3A]/40 uppercase tracking-widest">Digital receipt sent via email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-center text-[10px] text-[#CBAE73] font-black uppercase tracking-[0.3em] animate-pulse">
                    <Star className="w-3 h-3 fill-[#CBAE73]" /> Limited spots remaining for this session
                  </div>
                  <button onClick={next} className="w-full bg-[#3A3A3A] text-white py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-700">
                    Complete Booking — $120.00
                  </button>
                  <p className="text-center text-[9px] text-[#3A3A3A]/30 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> Encrypted & Secure SSL Checkout
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" {...variants} transition={transition} className="space-y-12 text-center py-12">
              <div className="w-24 h-24 bg-[#CBAE73]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-[#CBAE73]" />
                </motion.div>
              </div>
              <div className="space-y-6">
                <h1 className="font-display text-5xl md:text-7xl text-[#3A3A3A]">Your journey is set.</h1>
                <p className="text-xl text-[#3A3A3A]/50 font-light max-w-xl mx-auto italic">
                  "A sacred space has been reserved for your arrival. We look forward to meeting you in the stillness."
                </p>
              </div>

              <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-luxury border border-[#3A3A3A]/5 text-left space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-[#3A3A3A]/30 uppercase tracking-widest font-bold">Booking Reference</p>
                  <p className="text-lg font-display text-[#3A3A3A]">#LUMA-9284-BK</p>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#3A3A3A]/5">
                  <div className="space-y-1">
                    <p className="text-[9px] text-[#3A3A3A]/30 uppercase tracking-widest font-bold">Session</p>
                    <p className="text-sm font-bold text-[#3A3A3A]">{data.service}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] text-[#3A3A3A]/30 uppercase tracking-widest font-bold">Moment</p>
                    <p className="text-sm font-bold text-[#3A3A3A]">{data.date}, {data.time}</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-6">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-16 py-6 bg-[#3A3A3A] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all duration-700"
                >
                  Return to Sanctuary
                </button>
                <div className="flex justify-center items-center gap-2 text-[10px] text-[#CBAE73] font-bold uppercase tracking-[0.2em]">
                  <ArrowRight className="w-3 h-3" /> Digital pass sent to {data.email}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
