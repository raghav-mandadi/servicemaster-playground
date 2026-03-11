import React from 'react';
import { AlertCircle } from 'lucide-react';

type InputSize = 'regular' | 'skinny';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  error?: string;
  prefix?: string;
  label?: string;
}

export function Input({ size = 'regular', error, prefix, label, disabled, className = '', ...props }: InputProps) {
  const sizeClass = size === 'regular' ? 'py-2.5 px-4 text-[16px]' : 'py-1.5 px-3 text-[13px]';

  let stateClass = 'bg-white border-border text-text-primary';
  if (error) stateClass = 'bg-status-dangerSurface border-status-danger text-status-danger';
  if (disabled) stateClass = 'bg-surface-page border-border-card text-border-light cursor-not-allowed';

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[13px] font-medium text-text-primary">{label}</label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className={`absolute left-3 text-text-subtle ${size === 'regular' ? 'text-[16px]' : 'text-[13px]'}`}>{prefix}</span>
        )}
        <input
          disabled={disabled}
          className={`w-full border rounded-[4px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${sizeClass} ${stateClass} ${prefix ? (size === 'regular' ? 'pl-7' : 'pl-5') : ''} ${error ? 'pr-9' : ''} ${className}`}
          {...props}
        />
        {error && (
          <AlertCircle className="absolute right-3 text-status-danger" size={16} />
        )}
      </div>
      {error && <p className="text-[12px] text-status-danger">{error}</p>}
    </div>
  );
}
