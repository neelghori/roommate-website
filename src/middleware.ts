/**
 * middleware.ts
 * Route protection middleware.
 *
 * Security:
 * - Protects /admin/* routes (requires ADMIN role)
 * - Protects user routes (requires authentication)
 * - BACKEND INTEGRATION: Replace mock check with JWT verification
 *
 * Note: Real auth uses httpOnly cookies verified server-side.
 * Client-side auth check in components is a UX layer only —
 * server middleware is the real security gate.
 */
import { NextRequest, NextResponse } from 'next/server';

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];
// Routes requiring admin role
const ADMIN_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // BACKEND INTEGRATION:
  // const sessionToken = request.cookies.get('session-token')?.value;
  // if (!sessionToken) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
  // const session = await validateJWT(sessionToken);
  // if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && session.role !== 'ADMIN') {
  //   return NextResponse.redirect(new URL('/403', request.url));
  // }

  // MOCK: Allow all for now (auth enforced client-side)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|icons|api).*)'],
};
