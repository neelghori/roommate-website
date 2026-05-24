'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { pushService } from '@/services/modules/push.service';

/**
 * Registers service worker and saves push subscription when the user is signed in.
 */
export function WebPushManager() {
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!sessionReady || !isAuthenticated) return;
    if (!pushService.supportsWebPush()) return;

    const timer = window.setTimeout(() => {
      void pushService.ensureSubscribed();
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [sessionReady, isAuthenticated]);

  return null;
}
