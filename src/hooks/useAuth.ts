/**
 * useAuth.ts
 * Auth hook combining store + service actions.
 */
'use client';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/modules/auth.service';
import { useToast } from './useToast';
import { useRouter } from 'next/navigation';
import { LoginPayload, RegisterPayload } from '@/services/modules/auth.service';
import { getAccessToken } from '@/lib/authToken';
import { wsService } from '@/services/wsService';

export const useAuth = () => {
  const { user, isAuthenticated, isAdmin, setUser, setLoading, logout: logoutStore } = useAuthStore();
  const toast = useToast();
  const router = useRouter();

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const { user } = await authService.login(payload);
      setUser(user);
      wsService.connect(getAccessToken() ?? undefined);
      toast.success('Welcome back!', `Logged in as ${user.name}`);
      router.push('/');
    } catch {
      toast.error('Login failed', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const { user } = await authService.register(payload);
      setUser(user);
      wsService.connect(getAccessToken() ?? undefined);
      toast.success('Account created!', 'Welcome to Roommat');
      router.push('/onboarding');
    } catch {
      toast.error('Registration failed', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    logoutStore();
    router.push('/');
  };

  return { user, isAuthenticated, isAdmin, login, register, logout };
};
