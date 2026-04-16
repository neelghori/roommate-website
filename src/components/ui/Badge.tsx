/**
 * Badge.tsx
 * Status badges used on listing cards ("Hot", "Limited Offer", "New").
 * Also used for tags like "VERIFIED", "STUDENT", etc.
 */
'use client';
import React from 'react';

type BadgeVariant =
  | 'hot'
  | 'limited'
  | 'new'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default'
  | 'teal';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantMap: Record<BadgeVariant, string> = {
  hot: 'bg-red-500 text-white',
  limited: 'bg-orange-500 text-white',
  new: 'text-white',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
  teal: 'text-white',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  size = 'sm',
}) => {
  const inlineStyle: React.CSSProperties = {};
  if (variant === 'new' || variant === 'teal') {
    inlineStyle.backgroundColor = '#1B8F8F';
  }

  return (
    <span
      style={inlineStyle}
      className={[
        'inline-flex items-center font-semibold rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantMap[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};
