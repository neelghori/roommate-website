/**
 * Routes guests may open without signing in. All other (user) app paths require auth.
 * Used by UserAuthGate — guests hitting a protected URL are sent to /login?next=...
 */
export function isPublicGuestRoute(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';

  if (p === '/') return true;
  if (p === '/about') return true;
  if (p === '/privacy' || p === '/terms') return true;
  if (p === '/explore' || p.startsWith('/explore/')) return true;
  if (p === '/roommates') return true;
  if (p.startsWith('/roommates/')) {
    if (p === '/roommates/profile' || p.startsWith('/roommates/profile/')) return false;
    return true;
  }

  if (p.startsWith('/listings/')) {
    if (p === '/listings/add') return false;
    const segments = p.split('/').filter(Boolean);
    if (segments.length >= 3 && segments[segments.length - 1] === 'edit') return false;
    return true;
  }

  return false;
}
