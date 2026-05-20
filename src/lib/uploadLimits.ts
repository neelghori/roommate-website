/** Max size per listing photo — keep in sync with backend `constants/uploads.js`. */
import { isLikelyListingImageFile, normalizeListingImageFile } from '@/lib/normalizeImageFile';

export const MAX_LISTING_IMAGE_BYTES = 5 * 1024 * 1024;

export const MAX_LISTING_IMAGE_MB = 5;

/** Max files per gallery upload batch (backend `MAX_PROPERTY_GALLERY_FILES`). */
export const MAX_LISTING_GALLERY_FILES = 10;

/** Multipart overhead per request (boundaries, field names). */
export const MULTIPART_OVERHEAD_BYTES = 512 * 1024;

/** Mobile-friendly: image/* plus explicit HEIC (iOS gallery). */
export const LISTING_IMAGE_ACCEPT =
  'image/*,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif';

export function formatMaxListingImageLabel(): string {
  return `Max ${MAX_LISTING_IMAGE_MB} MB per photo`;
}

/** Axios / proxy-safe limit for a single-file multipart POST. */
export function multipartMaxBytesForFileCount(fileCount: number): number {
  const n = Math.max(1, Math.min(fileCount, MAX_LISTING_GALLERY_FILES));
  return n * MAX_LISTING_IMAGE_BYTES + MULTIPART_OVERHEAD_BYTES;
}

export function filterListingImageFiles(files: File[]): {
  accepted: File[];
  rejectedTooLarge: File[];
  rejectedType: File[];
} {
  const accepted: File[] = [];
  const rejectedTooLarge: File[] = [];
  const rejectedType: File[] = [];

  files.forEach((raw, index) => {
    if (!isLikelyListingImageFile(raw)) {
      rejectedType.push(raw);
      return;
    }
    const f = normalizeListingImageFile(raw, index);
    if (f.size > MAX_LISTING_IMAGE_BYTES) {
      rejectedTooLarge.push(f);
      return;
    }
    accepted.push(f);
  });

  return { accepted, rejectedTooLarge, rejectedType };
}
