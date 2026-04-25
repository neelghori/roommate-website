/**
 * Extracts a JWT / bearer access token from arbitrary API JSON shapes.
 * Handles nested objects, common key names, and JWT-shaped strings (eyJ…).
 */

const TOKEN_KEY_HINTS = [
  'accessToken',
  'access_token',
  'token',
  'jwt',
  'id_token',
  'idToken',
  'authToken',
  'bearerToken',
  'bearer',
];

function looksLikeJwt(value: string): boolean {
  const p = value.trim().split('.');
  return p.length === 3 && p.every((part) => part.length > 0);
}

/**
 * Depth-first search for a token: prefer known keys, then any string value that looks like a JWT.
 */
export function extractAccessTokenFromUnknown(data: unknown, maxDepth = 10): string | null {
  if (data == null) return null;

  if (typeof data === 'string') {
    const s = data.trim();
    return looksLikeJwt(s) ? s : null;
  }

  if (typeof data !== 'object' || maxDepth <= 0) return null;

  const obj = data as Record<string, unknown>;

  for (const key of TOKEN_KEY_HINTS) {
    const v = obj[key];
    if (typeof v === 'string' && v.length > 20) {
      const t = v.trim();
      if (looksLikeJwt(t) || t.startsWith('ey')) return t;
    }
  }

  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (typeof v === 'string' && v.length > 20) {
      const lower = key.toLowerCase();
      if (lower.includes('token') || lower.includes('jwt') || lower.includes('bearer')) {
        const t = v.trim();
        if (looksLikeJwt(t) || t.startsWith('ey')) return t;
      }
    }
  }

  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (v !== null && typeof v === 'object') {
      const nested = extractAccessTokenFromUnknown(v, maxDepth - 1);
      if (nested) return nested;
    }
  }

  return null;
}
