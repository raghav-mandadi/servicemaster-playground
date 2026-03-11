import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

type InputSize = 'regular' | 'skinny';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  onClear?: () => void;
}

export function SearchInput({ size = 'regular', onClear, disabled, value, onChange, className = '', ...props }: SearchInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const controlled = value !== undefined;
  const currentValue = controlled ? (value as string) : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    if (!controlled) setInternalValue('');
    onClear?.();
  };

  const sizeClass = size === 'regular' ? 'py-2.5 text-[16px] pl-10 pr-10' : 'py-1.5 text-[13px] pl-8 pr-8';
  const iconSize = size === 'regular' ? 16 : 13;
  const iconLeft = size === 'regular' ? 'left-3' : 'left-2.5';

  return (
    <div className="relative flex items-center">
      <Search
        className={`absolute ${iconLeft} text-text-subtle ${disabled ? 'opacity-50' : ''}`}
        size={iconSize}
      />
      <input
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full border border-border rounded-[4px] bg-white text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${sizeClass} ${disabled ? 'bg-surface-page cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
      {currentValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute right-3 text-text-subtle hover:text-text-primary`}
        >
          <X size={iconSize} />
        </button>
      )}
    </div>
  );
}
