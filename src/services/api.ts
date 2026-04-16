/**
 * services/api.ts
 * Axios instance configuration for backend integration.
 *
 * BACKEND INTEGRATION: When the Node.js backend is ready:
 * 1. Set NEXT_PUBLIC_API_URL in .env.local
 * 2. Remove mock interceptor
 * 3. All service modules will automatically use real endpoints
 *
 * Security:
 * - Tokens stored in httpOnly cookies (set by backend) — NOT localStorage
 * - CSRF token attached via X-CSRF-Token header (future)
 * - All requests over HTTPS in production
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

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

// Request interceptor — attach auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // BACKEND NOTE: Token will come from httpOnly cookie automatically via withCredentials
    // For JWT in Authorization header (if backend prefers), uncomment:
    // const token = getTokenFromSecureStorage();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle global errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
