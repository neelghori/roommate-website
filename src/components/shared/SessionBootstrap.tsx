'use client';

/**
 * On app load: JWT in sessionStorage → GET /auth/me → hydrate user.
 * No token → clear user. Replaces mock “always logged in” seed.
 */
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/modules/auth.service';
import { getAccessToken, clearAccessToken } from '@/lib/authToken';

export function SessionBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const setSessionReady = useAuthStore((s) => s.setSessionReady);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        if (!cancelled) setSessionReady(true);
        return;
      }
      try {
        const user = await authService.getMe();
        if (!cancelled) setUser(user);
        if (!cancelled && user) {
          void import('@/services/wsService').then((m) =>
            m.wsService.connect(getAccessToken() ?? undefined),
          );
        }
      } catch {
        clearAccessToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [setUser, setSessionReady]);

  return null;
}
