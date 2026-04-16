/**
 * Providers.tsx
 * Client-side providers wrapper (Zustand stores initialize here,
 * Toast container mounted, etc.)
 *
 * BACKEND INTEGRATION: Add React Query / SWR Provider here when ready.
 */
'use client';

import React from 'react';
import { ToastContainer } from '@/components/ui/Toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};
