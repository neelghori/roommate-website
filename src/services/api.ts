/**
 * services/api.ts
 * Axios instance configuration for backend integration.
 *
 * BACKEND INTEGRATION:
 * 1. Set NEXT_PUBLIC_API_URL to your API origin (e.g. https://api.example.com or http://localhost:8080).
 *    Leave unset or use '' so paths like /api/v1/... resolve from the site origin (useful with Next.js rewrites).
 * 2. Avoid NEXT_PUBLIC_API_URL=/api together with request paths that already start with /api/... (double /api).
 *
 * Security:
 * - Tokens stored in httpOnly cookies (set by backend) NOT localStorage
 * - CSRF token attached via X-CSRF-Token header (future)
 * - All requests over HTTPS in production
 */
import axios from 'axios';
import { getAccessToken } from '@/lib/authToken';
import { applyFormDataHeaders } from '@/lib/formDataUpload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    // Security header awareness:
    // 'X-CSRF-Token': getCsrfToken(), // Enable when backend ready
  },
  withCredentials: true, // Send httpOnly cookies with requests
});

// Request interceptor Bearer JWT from login/register + cookies (withCredentials)
apiClient.interceptors.request.use(
  (config) => {
    applyFormDataHeaders(config);
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor handle global errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = String(error.config?.url ?? '');
      // Don’t redirect for:
      // - failed login (wrong password) avoid reload loop on /login
      // - /auth/me used to load profile; 401 must be handled in-page (toast / re-auth), not a hard redirect
      const pathOnly = url.split('?')[0];
      const isPublicRoommateRead =
        pathOnly.includes('/tenant-roommate-profiles') &&
        !pathOnly.includes('/tenant-roommate-profiles/me');
      const skipRedirect =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/me') ||
        url.includes('/auth/change-password') ||
        url.includes('/tenant-roommate-profiles/me') ||
        isPublicRoommateRead ||
        url.includes('/upload/') ||
        url.includes('/bookings') ||
        url.includes('/chat/') ||
        (url.includes('/properties/') && url.includes('/save'));
      if (!skipRedirect && typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
