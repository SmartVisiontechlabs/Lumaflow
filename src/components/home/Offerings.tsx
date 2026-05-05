import { Sparkles, Activity, Heart, CircleDot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Offerings() {
  const offerings = [
    { icon: Sparkles, title: "Breathwork", desc: "Transform your breath." },
    { icon: Activity, title: "Somatic Movement", desc: "Reconnect with your physical body." },
    { icon: Heart, title: "Sacred Body Flow", desc: "Awaken your inner rhythm." },
    { icon: CircleDot, title: "Meditation", desc: "Cultivate profound stillness." }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1] }
    }
  };

  return (
    <section className="py-48 px-6 bg-white">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {offerings.map((item, idx) => (
            <motion.div key={idx} variants={itemVariants} className="h-full">
              <Link 
                to="/classes"
                className="group relative p-12 rounded-[2rem] border border-transparent hover:border-gold/10 transition-all duration-[800ms] bg-cream/20 hover:bg-white flex flex-col items-center text-center shadow-sm hover:shadow-luxury hover:-translate-y-2 overflow-hidden h-full"
              >
                {/* Subtle Gradient Border Effect */}
                <div className="absolute inset-0 border-[1px] border-gold/5 rounded-[2rem] group-hover:border-gold/20 transition-colors duration-700" />
                
                <div className="relative mb-10 text-gold group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                  <item.icon strokeWidth={1} className="w-10 h-10" />
                  <div className="absolute inset-0 bg-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                <h3 className="relative font-display text-2xl text-text-dark mb-4 group-hover:text-gold transition-colors duration-500">{item.title}</h3>
                <p className="relative text-text-dark/50 font-light text-sm leading-relaxed">{item.desc}</p>
                
                {/* Micro Shimmer Effect on Card */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                   <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1500ms] bg-gradient-to-r from-transparent via-gold/5 to-transparent" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
