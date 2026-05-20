import type { InternalAxiosRequestConfig } from 'axios';
import { normalizeListingImageFile } from '@/lib/normalizeImageFile';

/** Let the browser set multipart boundary (required on mobile Safari / Chrome). */
export function applyFormDataHeaders(config: InternalAxiosRequestConfig): void {
  if (!(config.data instanceof FormData)) return;
  const headers = config.headers;
  if (!headers) return;
  if (typeof headers.set === 'function') {
    headers.set('Content-Type', false);
    return;
  }
  delete (headers as Record<string, unknown>)['Content-Type'];
  delete (headers as Record<string, unknown>)['content-type'];
}

export function appendListingImages(fd: FormData, files: File[]): void {
  files.forEach((file, index) => {
    const normalized = normalizeListingImageFile(file, index);
    fd.append('images', normalized, normalized.name);
  });
}
