'use client';

/**
 * (user) layout gate: guests browse public routes; protected routes redirect to /#browse.
 * Signed-in users may access all (user) routes.
 */
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { isPublicGuestRoute } from '@/lib/publicRoutes';

export function UserAuthGate({ children }: { children: React.ReactNode }) {
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pathname = usePathname();

  useEffect(() => {
    if (!sessionReady || isAuthenticated) return;
    if (isPublicGuestRoute(pathname)) return;
    if (typeof window !== 'undefined') {
      window.location.assign('/#browse');
    }
  }, [sessionReady, isAuthenticated, pathname]);

  if (!sessionReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500 text-sm">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated && !isPublicGuestRoute(pathname)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500 text-sm">
        Taking you to browse listings…
      </div>
    );
  }

  return <>{children}</>;
}
