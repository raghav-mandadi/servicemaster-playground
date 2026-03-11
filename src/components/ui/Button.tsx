import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'regular' | 'skinny';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-white border border-border text-text-primary hover:bg-surface-page',
  danger: 'bg-status-danger text-white',
  ghost: 'border border-border text-text-primary',
};

const sizeClasses: Record<ButtonSize, string> = {
  regular: 'px-4 py-2 rounded-[8px] text-[16px] font-medium',
  skinny: 'px-3 py-1.5 rounded-[4px] text-[13px] font-medium',
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  regular: 'w-10 h-10 rounded-[8px]',
  skinny: 'w-7 h-7 rounded-[4px]',
};

export function Button({ variant = 'primary', size = 'regular', iconOnly = false, disabled, className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 transition-colors focus:outline-none';
  const variantClass = variantClasses[variant];
  const sizeClass = iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size];
  const disabledClass = disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      disabled={disabled}
      className={`${base} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
