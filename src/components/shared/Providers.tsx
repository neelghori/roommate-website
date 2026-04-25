/**
 * Providers.tsx
 * Client-side providers + session bootstrap (JWT → GET /auth/me).
 */
'use client';

import React from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import { RouteProgressBar } from '@/components/shared/RouteProgressBar';
import { SessionBootstrap } from '@/components/shared/SessionBootstrap';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      <RouteProgressBar />
      <SessionBootstrap />
      {children}
      <ToastContainer />
    </>
  );
};
