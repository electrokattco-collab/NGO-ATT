import React from 'react';
import { cn } from '@/src/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({ children, className, hoverable = false }: CardProps) => {
  return (
    <div className={cn(
      'bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm transition-all',
      hoverable && 'hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/20',
      className
    )}>
      {children}
    </div>
  );
};
