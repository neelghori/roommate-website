/**
 * auth.service.ts
 * Authentication service module.
 *
 * MOCK MODE: Returns mock data with artificial delay.
 * BACKEND INTEGRATION: Replace mock functions with apiClient calls.
 *
 * Expected endpoints:
 *   POST /auth/login          → { user, token }
 *   POST /auth/register       → { user, token }
 *   POST /auth/forgot-password → { message }
 *   POST /auth/reset-password  → { message }
 *   POST /auth/logout          → { message }
 *   GET  /auth/me              → { user }
 */

import { User } from '@/types';

// Mock delay to simulate network latency
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'TENANT' | 'OWNER';
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

const MOCK_USER: User = {
  id: 'u1',
  name: 'Guest User',
  email: 'guest@roommat.in',
  phone: '+91 9876543210',
  avatarInitial: 'GU',
  role: 'TENANT',
  isPhoneVerified: true,
  isAadharVerified: false,
  isCompanyVerified: true,
  listingCount: 0,
  shortlistedCount: 0,
  connectCount: 0,
  bio: 'Looking for a clean and peaceful place to stay.',
  location: 'Ahmedabad',
  budget: 15000,
  lifestyle: ['WORKING', 'VEGETARIAN', 'NON_SMOKER'],
  createdAt: '2024-01-15T10:00:00Z',
};

export const authService = {
  /**
   * Login user with email & password.
   * BACKEND: POST /auth/login
   */
  login: async (payload: LoginPayload): Promise<{ user: User; token: string }> => {
    await delay();
    // MOCK: Accept any credentials for demo
    if (!payload.email || !payload.password) {
      throw new Error('Invalid credentials');
    }
    return { user: MOCK_USER, token: 'mock-jwt-token' };
  },

  /**
   * Register a new user.
   * BACKEND: POST /auth/register
   */
  register: async (payload: RegisterPayload): Promise<{ user: User; token: string }> => {
    await delay();
    return {
      user: { ...MOCK_USER, name: payload.name, email: payload.email, phone: payload.phone },
      token: 'mock-jwt-token',
    };
  },

  /**
   * Send password reset email.
   * BACKEND: POST /auth/forgot-password
   */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
    await delay();
    return { message: `Password reset link sent to ${payload.email}` };
  },

  /**
   * Reset password with token.
   * BACKEND: POST /auth/reset-password
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    await delay();
    void payload; // used in real implementation
    return { message: 'Password reset successfully' };
  },

  /**
   * Logout user (clears httpOnly cookie on backend).
   * BACKEND: POST /auth/logout
   */
  logout: async (): Promise<void> => {
    await delay(300);
    // BACKEND: apiClient.post('/auth/logout')
  },

  /**
   * Get current authenticated user.
   * BACKEND: GET /auth/me
   */
  getMe: async (): Promise<User> => {
    await delay(300);
    return MOCK_USER;
  },
};
