'use client';

/**
 * (user) layout gate: guests browse public routes; protected routes redirect to login with `next`.
 * Signed-in users may access all (user) routes.
 */
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { isPublicGuestRoute } from '@/lib/publicRoutes';

export function UserAuthGate({ children }: { children: React.ReactNode }) {
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!sessionReady || isAuthenticated) return;
    if (isPublicGuestRoute(pathname)) return;
    const next = encodeURIComponent(pathname || '/');
    router.replace(`/login?next=${next}`);
  }, [sessionReady, isAuthenticated, pathname, router]);

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
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
