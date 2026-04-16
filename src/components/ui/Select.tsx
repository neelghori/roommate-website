/**
 * Select.tsx
 * Reusable select/dropdown component with label, error, and options support.
 * Matches the Roommat design system with teal focus ring.
 */
'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Array of options to render in the select. Use `disabled` to grey out individual items. */
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      fullWidth = true,
      containerClassName = '',
      className = '',
      disabled,
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div
        className={['flex flex-col gap-1', fullWidth ? 'w-full' : '', containerClassName].join(' ')}
      >
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={[
              'w-full appearance-none rounded-xl border bg-white text-sm text-gray-900 transition-all duration-200',
              'focus:outline-none',
              'pl-3 pr-10 py-2.5',
              error ? 'border-red-400' : 'border-gray-200',
              disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer',
              !value || value === '' ? 'text-gray-400' : 'text-gray-900',
              className,
            ].join(' ')}
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
              error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 pointer-events-none text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-500 mt-0.5">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${selectId}-hint`} className="text-xs text-gray-400 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
