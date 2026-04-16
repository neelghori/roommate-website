/**
 * Input.tsx
 * Reusable text input component with label, error, icon support.
 * Matches the Roommat design system with teal focus ring.
 */
'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      fullWidth = true,
      containerClassName = '',
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={['flex flex-col gap-1', fullWidth ? 'w-full' : '', containerClassName].join(' ')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={[
              'w-full rounded-xl border bg-white text-sm text-gray-900 placeholder-gray-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              leftIcon ? 'pl-10' : 'pl-3',
              rightIcon ? 'pr-10' : 'pr-3',
              'py-2.5',
              error
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-200 focus:border-transparent',
              disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : '',
              className,
            ].join(' ')}
            style={
              !error
                ? ({ '--tw-ring-color': '#1B8F8F33' } as React.CSSProperties)
                : undefined
            }
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = '#1B8F8F';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27,143,143,0.15)';
              }
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? '#f87171' : '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              props.onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div
              className={[
                'absolute right-3 flex items-center text-gray-400',
                onRightIconClick ? 'cursor-pointer hover:text-gray-600' : 'pointer-events-none',
              ].join(' ')}
              onClick={onRightIconClick}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-400 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
