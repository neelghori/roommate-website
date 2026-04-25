import axios from 'axios';
import { getAdminAccessToken } from '@/lib/adminAuthToken';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

adminApiClient.interceptors.request.use((config) => {
  const token = getAdminAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApiClient.interceptors.response.use(
  (r) => r,
  (error) => Promise.reject(error),
);
