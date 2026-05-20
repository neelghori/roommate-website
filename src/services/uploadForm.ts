import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/api';
import { MAX_LISTING_IMAGE_BYTES } from '@/lib/uploadLimits';

/** Room for one max listing photo plus multipart overhead. */
const MULTIPART_MAX_BYTES = MAX_LISTING_IMAGE_BYTES + 2 * 1024 * 1024;

/**
 * POST multipart via the same axios instance as all other API calls (same baseURL, auth, cookies).
 * Clears the default JSON Content-Type so the browser sets multipart boundaries on FormData.
 */
export async function postMultipartForm(path: string, formData: FormData): Promise<Record<string, unknown>> {
  const config: AxiosRequestConfig = {
    transformRequest: [
      (data, headers) => {
        if (data instanceof FormData && headers) {
          delete headers['Content-Type'];
          delete headers['content-type'];
        }
        return data;
      },
    ],
    maxBodyLength: MULTIPART_MAX_BYTES,
    maxContentLength: MULTIPART_MAX_BYTES,
    timeout: 120_000,
  };
  const { data } = await apiClient.post<Record<string, unknown>>(path, formData, config);
  return data as Record<string, unknown>;
}
