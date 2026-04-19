/**
 * Providers.tsx
 * Client-side providers wrapper.
 * Also seeds the auth store with the mock user so the desktop
 * UI always shows as authenticated (replaces actual login flow
 * until the backend is wired).
 *
 * BACKEND INTEGRATION: Remove the mock-user seed below and instead
 * call an /api/me endpoint here (or in middleware) to hydrate the store.
 */
'use client';

import React, { useEffect } from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import { RouteProgressBar } from '@/components/shared/RouteProgressBar';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_USER } from '@/mock/data/users';

interface ProvidersProps {
  children: React.ReactNode;
}

function AuthSeed() {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    // Seed mock user once on first load if no session exists.
    // BACKEND: delete this entire effect and let login/session handle it.
    if (!isAuthenticated) {
      setUser(CURRENT_USER);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      <RouteProgressBar />
      <AuthSeed />
      {children}
      <ToastContainer />
    </>
  );
};
