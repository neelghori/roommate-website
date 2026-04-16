/**
 * authStore.ts
 * Authentication state management using Zustand.
 * Persisted in sessionStorage (NOT localStorage) for security.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isAdmin: user?.role === 'ADMIN',
        }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        }),
    }),
    {
      name: 'roommat-auth', // sessionStorage key
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? sessionStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
      // SECURITY: Only persist non-sensitive fields
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              name: state.user.name,
              role: state.user.role,
              avatarInitial: state.user.avatarInitial,
            }
          : null,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);
