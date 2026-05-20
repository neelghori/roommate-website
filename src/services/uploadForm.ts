import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/api';
import { multipartMaxBytesForFileCount } from '@/lib/uploadLimits';

export type PostMultipartOptions = {
  /** How many files are in this FormData (defaults to 1). Sets axios body size cap. */
  fileCount?: number;
  timeoutMs?: number;
};

/**
 * POST multipart via the same axios instance as all other API calls (same baseURL, auth, cookies).
 * Clears the default JSON Content-Type so the browser sets multipart boundaries on FormData.
 */
export async function postMultipartForm(
  path: string,
  formData: FormData,
  options?: PostMultipartOptions,
): Promise<Record<string, unknown>> {
  const fileCount = options?.fileCount ?? 1;
  const maxBytes = multipartMaxBytesForFileCount(fileCount);

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
    maxBodyLength: maxBytes,
    maxContentLength: maxBytes,
    timeout: options?.timeoutMs ?? 120_000,
  };
  const { data } = await apiClient.post<Record<string, unknown>>(path, formData, config);
  return data as Record<string, unknown>;
}
