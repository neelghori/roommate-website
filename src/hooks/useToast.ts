/**
 * useToast.ts
 * Convenience hook for showing toast notifications.
 *
 * Return value is referentially stable so it is safe to list in useEffect deps
 * (unstable handlers would retrigger effects every render → flicker / request loops).
 */
import { useCallback, useMemo } from 'react';
import { useUIStore } from '@/store/uiStore';
import { ToastType } from '@/types';

export const useToast = () => {
  const addToast = useUIStore((s) => s.addToast);

  const toast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 3000) => {
      addToast({ type, title, message, duration });
    },
    [addToast],
  );

  return useMemo(
    () => ({
      success: (title: string, message?: string) => toast('success', title, message),
      error: (title: string, message?: string) => toast('error', title, message),
      warning: (title: string, message?: string) => toast('warning', title, message),
      info: (title: string, message?: string) => toast('info', title, message),
    }),
    [toast],
  );
};
