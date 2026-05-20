/**
 * Mobile browsers (especially iOS Safari) often provide camera/gallery files with:
 * - empty `file.type`
 * - generic names like "image" or "image.jpg"
 * Multer and our validators need a real extension + MIME for multipart uploads.
 */

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
};

/** True for desktop + mobile camera/gallery picks (including empty MIME). */
export function isLikelyListingImageFile(file: File): boolean {
  const type = (file.type || '').trim().toLowerCase();
  if (type.startsWith('image/')) return true;

  const name = (file.name || '').trim().toLowerCase();
  if (/\.(jpe?g|png|webp|gif|heic|heif)$/i.test(name)) return true;

  // iOS: type "" or application/octet-stream, name "image" / "image.jpg" / no extension
  if (!type || type === 'application/octet-stream') {
    if (!name || name === 'image' || /^image\.(jpe?g|png|heic|heif)?$/i.test(name)) return true;
  }

  return false;
}

function inferMimeFromName(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = m?.[1];
  return (ext && EXT_TO_MIME[ext]) || 'image/jpeg';
}

/**
 * Returns a File with stable `name` + `type` for FormData.append(..., filename).
 * Does not re-encode; same bytes as the original pick.
 */
export function normalizeListingImageFile(file: File, index = 0): File {
  let name = (file.name || '').trim();
  let type = (file.type || '').trim().toLowerCase();

  if (!name || name.toLowerCase() === 'image') {
    name = `photo-${Date.now()}-${index}.jpg`;
  } else if (!/\.[a-z0-9]+$/i.test(name)) {
    if (type.includes('png')) name = `${name}.png`;
    else if (type.includes('webp')) name = `${name}.webp`;
    else if (type.includes('heic')) name = `${name}.heic`;
    else if (type.includes('heif')) name = `${name}.heif`;
    else name = `${name}.jpg`;
  }

  if (!type || type === 'application/octet-stream') {
    type = inferMimeFromName(name);
  }

  if (name === file.name && type === file.type) return file;
  return new File([file], name, { type, lastModified: file.lastModified });
}
