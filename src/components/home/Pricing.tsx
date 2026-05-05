import { motion } from 'framer-motion';

export default function Pricing() {
  const plans = [
    {
      name: "Single Session",
      outcome: "A gentle introduction to your inner space.",
      price: "$45",
      period: "per session",
      highlighted: false
    },
    {
      name: "Intro Offer",
      outcome: "The perfect start to your healing journey.",
      price: "$99",
      period: "3 sessions",
      highlighted: true,
      badge: "Most Popular"
    },
    {
      name: "10-Class Package",
      outcome: "Deepen your practice and anchor into peace.",
      price: "$350",
      period: "10 journeys",
      highlighted: false
    }
  ];

  const trustItems = [
    { label: "Secure payment", icon: "🔒" },
    { label: "Real-time booking", icon: "🕒" },
    { label: "Max 6 people per class", icon: "👥" },
    { label: "Zoom access", icon: "🎥" }
  ];

  return (
    <>
      <div className="section-transition" />
      <section className="py-48 bg-white relative section-fade-top section-fade-bottom">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="text-center mb-32"
          >
            <span className="text-gold text-xs font-medium tracking-[0.3em] uppercase mb-4 block">The Investment</span>
            <h2 className="font-display text-5xl md:text-6xl text-text-dark font-light">
              Invest in your <span className="italic text-gold">peace</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: index * 0.2 }}
                className={`relative p-12 rounded-2xl flex flex-col items-center text-center transition-all duration-700 w-full bg-white/70 backdrop-blur shadow-sm border border-gold/5
                  ${plan.highlighted ? 'md:scale-105 z-10 border-[#CBAE73]/30 shadow-xl' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 bg-[#CBAE73] text-black px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase shadow-lg shadow-gold/20">
                    {plan.badge}
                  </div>
                )}
                
                <h3 className="text-2xl font-display text-text-dark mb-6">
                  {plan.name}
                </h3>
                
                <p className="text-text-dark/40 font-body font-light mb-12 text-base leading-relaxed">
                  {plan.outcome}
                </p>
                
                <div className="mb-12 mt-auto">
                  <span className="text-5xl font-display text-text-dark">{plan.price}</span>
                  <span className="text-sm font-body text-text-dark/40 ml-3 tracking-widest">{plan.period}</span>
                </div>
                
                <button 
                  className={`w-full py-5 rounded-xl text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-700 
                    ${plan.highlighted 
                      ? 'bg-[#CBAE73] text-black shadow-xl shadow-gold/10 hover:scale-105' 
                      : 'bg-white text-text-dark border border-gold/10 hover:border-gold/40'
                    }`}
                >
                  Begin Your Practice
                </button>
              </motion.div>
            ))}
          </div>

          {/* Trust Row */}
          <div className="mt-32 flex flex-wrap justify-center gap-x-16 gap-y-8 opacity-60">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gold text-lg">{item.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


