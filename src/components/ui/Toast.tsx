import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-gold" />,
  };

  const backgrounds = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    info: 'bg-white border-gold/20',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className={cn(
            "fixed bottom-12 right-12 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-luxury min-w-[300px]",
            backgrounds[type]
          )}
        >
          <div className="flex-shrink-0">{icons[type]}</div>
          <p className="flex-1 text-[11px] font-bold uppercase tracking-widest text-text-dark">{message}</p>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-cream rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-text-dark/20" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
