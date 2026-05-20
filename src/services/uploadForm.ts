import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/api';
import { multipartMaxBytesForFileCount } from '@/lib/uploadLimits';
import { applyFormDataHeaders } from '@/lib/formDataUpload';

export type MultipartFormOptions = {
  /** How many files are in this FormData (defaults to 1). Sets axios body size cap. */
  fileCount?: number;
  timeoutMs?: number;
};

function buildMultipartConfig(options?: MultipartFormOptions): AxiosRequestConfig {
  const fileCount = options?.fileCount ?? 1;
  const maxBytes = multipartMaxBytesForFileCount(fileCount);

  return {
    headers: {
      // Axios: false = do not set Content-Type; browser adds boundary (critical on phone).
      'Content-Type': false,
    },
    maxBodyLength: maxBytes,
    maxContentLength: maxBytes,
    timeout: options?.timeoutMs ?? 120_000,
    transformRequest: [
      (data, _headers, config) => {
        if (data instanceof FormData && config) {
          applyFormDataHeaders(config);
        }
        return data;
      },
    ],
  };
}

/** POST multipart — create resources or dedicated upload routes (not property update). */
export async function postMultipartForm(
  path: string,
  formData: FormData,
  options?: MultipartFormOptions,
): Promise<Record<string, unknown>> {
  const config = buildMultipartConfig(options);
  const { data } = await apiClient.post<Record<string, unknown>>(path, formData, config);
  return data as Record<string, unknown>;
}

/**
 * PATCH multipart — matches API `PATCH /api/v1/properties/:id` (partial update + images).
 * Do not use POST on `/:id`; the backend does not define that route.
 */
export async function patchMultipartForm(
  path: string,
  formData: FormData,
  options?: MultipartFormOptions,
): Promise<Record<string, unknown>> {
  const config = buildMultipartConfig(options);
  const { data } = await apiClient.patch<Record<string, unknown>>(path, formData, config);
  return data as Record<string, unknown>;
}
