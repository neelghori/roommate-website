/**
 * Checkbox.tsx
 * Reusable checkbox component with label and error support.
 * Styled with teal checkmark matching the Roommat design system.
 */
'use client';

import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  description?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      description,
      containerClassName = '',
      className = '',
      disabled,
      checked,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const checkboxId = id ?? (label ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={['flex flex-col gap-1', containerClassName].join(' ')}>
        <label
          htmlFor={checkboxId}
          className={[
            'flex items-start gap-2.5 cursor-pointer select-none',
            disabled ? 'cursor-not-allowed opacity-60' : '',
          ].join(' ')}
        >
          {/* Hidden native checkbox for accessibility */}
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            aria-invalid={!!error}
            aria-describedby={error ? `${checkboxId}-error` : undefined}
            {...props}
          />

          {/* Custom checkbox box */}
          <div
            className={[
              'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 mt-0.5',
              checked
                ? 'border-transparent'
                : error
                ? 'border-red-400 bg-white'
                : 'border-gray-300 bg-white hover:border-teal-400',
              disabled ? 'opacity-60' : '',
            ].join(' ')}
            style={checked ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F' } : undefined}
          >
            {checked && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>

          {/* Label text */}
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-sm font-medium text-gray-800">{label}</span>
              )}
              {description && (
                <span className="text-xs text-gray-500 mt-0.5">{description}</span>
              )}
            </div>
          )}
        </label>

        {error && (
          <p id={`${checkboxId}-error`} className="text-xs text-red-500 ml-7">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
