'use client';

/**
 * (user) layout gate: guests browse public routes; protected routes redirect to login with `next`.
 * Signed-in users may access all (user) routes.
 */
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { isPublicGuestRoute } from '@/lib/publicRoutes';
import { loginHrefForProtectedPath } from '@/lib/loginRedirect';
import { shouldCompleteProfile } from '@/config/rolesConfig';

export function UserAuthGate({ children }: { children: React.ReactNode }) {
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = pathname || '/';
  const isPublicRoute = isPublicGuestRoute(currentPath);

  useEffect(() => {
    if (!sessionReady) return;

    if (isAuthenticated) {
      if (shouldCompleteProfile(user)) {
        if (pathname !== '/profile-completion') {
          router.replace('/profile-completion');
        }
      } else {
        if (pathname === '/profile-completion') {
          router.replace('/');
        }
      }
      return;
    }

    if (isPublicRoute) return;
    router.replace(loginHrefForProtectedPath(currentPath));
  }, [sessionReady, isAuthenticated, isPublicRoute, currentPath, pathname, user, router]);

  // Never block public pages behind client-session bootstrap; this keeps
  // server-rendered HTML crawlable for SEO bots that do not run JS.
  if (isPublicRoute && pathname !== '/profile-completion') {
    return <>{children}</>;
  }

  if (!sessionReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500 text-sm">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500 text-sm">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
