import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/api';

/**
 * POST multipart via the same axios instance as all other API calls (same baseURL, auth, cookies).
 * Clears the default JSON Content-Type so the browser can set multipart boundaries on FormData.
 */
export async function postMultipartForm(path: string, formData: FormData): Promise<Record<string, unknown>> {
  const config: AxiosRequestConfig = {
    headers: {
      // Axios: omitting JSON Content-Type allows multipart/form-data + boundary for FormData
      'Content-Type': false,
    },
    maxBodyLength: 20 * 1024 * 1024,
    maxContentLength: 20 * 1024 * 1024,
    timeout: 120_000,
  };
  const { data } = await apiClient.post<Record<string, unknown>>(path, formData, config);
  return data as Record<string, unknown>;
}
