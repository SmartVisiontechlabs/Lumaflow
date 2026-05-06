import React from 'react';
import { motion } from 'framer-motion';

interface StepHeadingProps {
  title: string;
  subtitle: string;
  tag?: string;
}

export default function StepHeading({ title, subtitle, tag }: StepHeadingProps) {
  return (
    <div className="text-center space-y-4 mb-10 max-w-2xl mx-auto">
      {tag && (
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60">
          {tag}
        </p>
      )}
      <h2 className="font-display text-4xl md:text-5xl text-text-dark/90 leading-tight">
        {title}
      </h2>
      <p className="text-text-dark/40 font-light italic text-lg leading-relaxed px-4">
        “{subtitle}”
      </p>
    </div>
  );
}
