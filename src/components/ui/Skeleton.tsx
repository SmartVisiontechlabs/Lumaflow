import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton = ({ className, variant = 'rectangular' }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-text-dark/5",
        variant === 'circular' ? "rounded-full" : "rounded-2xl",
        className
      )}
    />
  );
};

export const TableSkeleton = () => (
  <div className="space-y-6">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-6 p-8 bg-white/40 border border-text-dark/5 rounded-[2rem]">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    ))}
  </div>
);
