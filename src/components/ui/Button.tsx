/**
 * Button.tsx
 * Reusable button component with variants matching the Roommat design system.
 *
 * Variants:
 * - primary: Dark teal background (#1B8F8F) - used for main actions
 * - accent: Orange background (#F57C00) - used for "Book Visit", CTAs
 * - secondary: Light teal outline
 * - outline: Border only
 * - danger: Red background
 * - ghost: No background
 */
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'text-white border-transparent hover:opacity-90 active:opacity-80',
  accent: 'text-white border-transparent hover:opacity-90 active:opacity-80',
  secondary: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
  outline: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50',
  danger: 'bg-red-500 text-white border-transparent hover:bg-red-600',
  ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const inlineStyle: React.CSSProperties = {};
  if (variant === 'primary') {
    inlineStyle.backgroundColor = '#1B8F8F';
    inlineStyle.borderColor = '#1B8F8F';
  } else if (variant === 'accent') {
    inlineStyle.backgroundColor = '#F57C00';
    inlineStyle.borderColor = '#F57C00';
  }

  return (
    <button
      style={inlineStyle}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        variant === 'primary' ? 'focus:ring-teal-400' : '',
        variant === 'accent' ? 'focus:ring-orange-400' : '',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : leftIcon ? (
        <span>{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};
