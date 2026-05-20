/** Max size per listing photo — keep in sync with backend `constants/uploads.js`. */
export const MAX_LISTING_IMAGE_BYTES = 5 * 1024 * 1024;

export const MAX_LISTING_IMAGE_MB = 5;

export function formatMaxListingImageLabel(): string {
  return `Max ${MAX_LISTING_IMAGE_MB} MB per photo`;
}

export function filterListingImageFiles(files: File[]): {
  accepted: File[];
  rejectedTooLarge: File[];
  rejectedType: File[];
} {
  const accepted: File[] = [];
  const rejectedTooLarge: File[] = [];
  const rejectedType: File[] = [];

  for (const f of files) {
    const isImage =
      f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name);
    if (!isImage) {
      rejectedType.push(f);
      continue;
    }
    if (f.size > MAX_LISTING_IMAGE_BYTES) {
      rejectedTooLarge.push(f);
      continue;
    }
    accepted.push(f);
  }

  return { accepted, rejectedTooLarge, rejectedType };
}
