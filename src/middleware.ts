/**
 * middleware.ts
 * Route protection middleware.
 *
 * Security model:
 * - Auth pages: /login, /register, /forgot-password, /reset-password (always allowed)
 * - Admin routes: /admin/* client-side AdminLayout (backend JWT when integrated)
 * - Main app: browsing is public; account-only areas are gated in UserAuthGate (client)
 *
 * BACKEND INTEGRATION: Uncomment the JWT validation block below.
 * The mock implementation allows all requests through (auth enforced client-side).
 *
 * CSP, XSS, and secure-cookie headers are set in next.config.ts.
 */

import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

const ADMIN_PREFIX = '/admin';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Always allow public routes ──────────────────────────────────────────────
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ── BACKEND INTEGRATION: Replace mock block with real JWT check ─────────────
  //
  // const sessionToken = request.cookies.get('roommat-session')?.value;
  //
  // if (!sessionToken) {
  //   const loginUrl = new URL('/login', request.url);
  //   loginUrl.searchParams.set('next', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }
  //
  // const payload = await verifyJWT(sessionToken);
  //
  // if (!payload) {
  //   const res = NextResponse.redirect(new URL('/login', request.url));
  //   res.cookies.delete('roommat-session');
  //   return res;
  // }
  //
  // if (pathname.startsWith(ADMIN_PREFIX) && payload.role !== 'ADMIN') {
  //   return NextResponse.redirect(new URL('/403', request.url));
  // }
  //
  // ── End of BACKEND INTEGRATION block ────────────────────────────────────────

  void ADMIN_PREFIX; // referenced in backend block above

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|images|icons|fonts|api).*)',
  ],
};
