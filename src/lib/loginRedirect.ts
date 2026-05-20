/**
 * Login `next` redirect safety — never send a new user to another account's edit URL.
 */

const LISTING_EDIT_PATH = /^\/listings\/[^/]+\/edit$/;

export function isListingEditPath(pathname: string): boolean {
  const p = (pathname || '/').replace(/\/$/, '') || '/';
  return LISTING_EDIT_PATH.test(p);
}

/** `/listings/:id/edit` → `/listings/:id` (view-only), or null if not an edit path. */
export function listingDetailPathFromEditPath(pathname: string): string | null {
  const p = (pathname || '/').replace(/\/$/, '') || '/';
  const m = p.match(/^\/listings\/([^/]+)\/edit$/);
  return m ? `/listings/${m[1]}` : null;
}

/** Decode and validate `next`; never return another user's edit URL. */
export function sanitizeLoginNextPath(raw: string | null): string {
  if (!raw) return '/';
  try {
    const path = decodeURIComponent(raw);
    if (!path.startsWith('/') || path.startsWith('//')) return '/';
    const viewPath = listingDetailPathFromEditPath(path);
    if (viewPath) return viewPath;
    return path;
  } catch {
    return '/';
  }
}

/** Build login URL; omit stale edit paths from `next`. */
export function loginHrefForProtectedPath(pathname: string): string {
  if (isListingEditPath(pathname)) return '/login';
  const next = encodeURIComponent(pathname || '/');
  return `/login?next=${next}`;
}
