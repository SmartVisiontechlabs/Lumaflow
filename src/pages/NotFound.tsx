import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="space-y-8"
      >
        <p className="text-[10px] text-gold font-bold uppercase tracking-[0.5em]">Error 404</p>
        <h1 className="font-display text-6xl md:text-8xl text-text-dark leading-tight">
          Lost in the <br />
          <span className="italic text-gold">stillness</span>
        </h1>
        <p className="text-lg text-text-dark/50 font-light max-w-md mx-auto">
          The page you are looking for has moved to a quieter space. Let's return you to the sanctuary.
        </p>
        <div className="pt-8">
          <Link 
            to="/" 
            className="px-14 py-5 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all duration-500"
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
