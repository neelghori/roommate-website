/**
 * Google avatar URLs often block hotlinking when the browser sends a Referer.
 * Normalize size and use `referrerPolicy="no-referrer"` on <img> (see UserAvatarImage).
 */
export function isGoogleUserContentUrl(url: string): boolean {
  return /googleusercontent\.com/i.test(url);
}

export function normalizeAvatarUrl(url: string | undefined | null): string | undefined {
  if (url == null) return undefined;
  const trimmed = String(url).trim();
  if (!trimmed) return undefined;

  let normalized = trimmed;
  if (normalized.startsWith('http://')) {
    normalized = `https://${normalized.slice(7)}`;
  }

  if (!isGoogleUserContentUrl(normalized)) {
    return normalized;
  }

  try {
    let base = normalized.replace(/=s\d+(-c)?$/i, '');
    const parsed = new URL(base);
    parsed.searchParams.set('sz', '256');
    return parsed.toString();
  } catch {
    const withoutSize = normalized.replace(/=s\d+(-c)?$/i, '');
    const joiner = withoutSize.includes('?') ? '&' : '?';
    return `${withoutSize}${joiner}sz=256`;
  }
}
