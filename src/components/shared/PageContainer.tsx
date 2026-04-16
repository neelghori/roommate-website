/**
 * PageContainer.tsx
 * Centered container for page content with consistent padding.
 */
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = 'lg',
}) => (
  <div className={['mx-auto px-4 py-4', maxWidthMap[maxWidth], className].join(' ')}>
    {children}
  </div>
);
