/**
 * Access token from login/register JSON responses — sent as Bearer on API calls.
 * Session-scoped (tab); cleared on logout. Prefer httpOnly cookies server-side when available.
 */
const STORAGE_KEY = 'roommat-access-token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      sessionStorage.setItem(STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* quota / private mode */
  }
}

export function clearAccessToken(): void {
  setAccessToken(null);
}
