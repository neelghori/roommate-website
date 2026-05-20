/** Hostnames allowed for property tour / walkthrough links. */
const YOUTUBE_HOSTS = new Set(['youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com']);

function youtubeHost(hostname: string): string {
  return hostname.replace(/^www\./i, '').toLowerCase();
}

function isYoutubeHost(hostname: string): boolean {
  const h = youtubeHost(hostname);
  return YOUTUBE_HOSTS.has(h) || h.endsWith('.youtube.com');
}

/**
 * Returns a normalized https URL when input is a valid YouTube link, otherwise null.
 */
export function parseYoutubeUrl(input: string | undefined | null): string | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!isYoutubeHost(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** True when text looks like a YouTube URL (used before strict parse). */
export function looksLikeYoutubeUrl(input: string | undefined | null): boolean {
  const raw = (input ?? '').trim();
  if (!raw) return false;
  return /(?:^|\/\/)(?:[a-z0-9-]+\.)*youtu(?:\.be|be\.com)/i.test(raw);
}

/**
 * Href for links: strict parse first, then loose normalize for values already stored on the property.
 */
export function resolveYoutubeHref(input: string | undefined | null): string | null {
  const parsed = parseYoutubeUrl(input);
  if (parsed) return parsed;
  const raw = (input ?? '').trim();
  if (!raw || !looksLikeYoutubeUrl(raw)) return null;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export function isValidYoutubeUrl(input: string | undefined | null): boolean {
  return parseYoutubeUrl(input) != null || looksLikeYoutubeUrl(input);
}

/** Value to send on create/update API (normalized https URL or null to clear). */
export function youtubeUrlForApi(input: string | undefined | null): string | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  return parseYoutubeUrl(raw) ?? resolveYoutubeHref(raw);
}
