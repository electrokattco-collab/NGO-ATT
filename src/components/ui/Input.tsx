import React from 'react';
import { cn } from '@/src/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-6 py-4 bg-white border border-slate-100 rounded-xl outline-none font-bold text-dark transition-all placeholder:text-slate-300',
            'focus:border-primary focus:ring-4 focus:ring-primary/5',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/5' : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-tight ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
