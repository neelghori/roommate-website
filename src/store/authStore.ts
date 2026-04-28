/**
 * authStore.ts
 * Auth state — in-memory only. Session is defined by JWT in sessionStorage + GET /auth/me.
 * (Persisted partial user was removed to avoid “logged in” UI without a valid token.)
 */
import { create } from 'zustand';
import { User } from '@/types';
import { clearAccessToken } from '@/lib/authToken';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  /** True after we’ve decided session from token (or lack of it) — used for route guards */
  sessionReady: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSessionReady: (sessionReady: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isAdmin: false,
  sessionReady: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setSessionReady: (sessionReady) => set({ sessionReady }),
  logout: () => {
    clearAccessToken();
    void import('@/services/wsService').then((m) => m.wsService.disconnect());
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },
}));
