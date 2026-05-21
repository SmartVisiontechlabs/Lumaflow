import { Variants } from 'framer-motion';

export const stepTransition: Variants = {
  initial: {
    opacity: 0,
    filter: 'blur(6px)',
    y: 20,
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: {
      duration: 0.45, // Calming 450ms
      ease: [0.22, 1, 0.36, 1], // Custom luxury easing
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(6px)',
    y: -12, // translateY(-12px)
    transition: {
      duration: 0.4, // 400ms outgoing fade out & blur
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const staggeredContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
