/**
 * src/app/api/auth/[...nextauth]/route.ts
 *
 * FRONTEND-ONLY STUB
 * This file is a placeholder. Real NextAuth integration happens when the
 * Node.js backend is ready.
 *
 * BACKEND INTEGRATION:
 *   1. npm install next-auth @auth/prisma-adapter bcryptjs
 *   2. Replace this file with real NextAuth handlers from src/lib/auth.ts
 *   3. Set AUTH_SECRET, DATABASE_URL in .env.local
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'Auth API not yet connected. Frontend uses mock auth.' },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: 'Auth API not yet connected. Frontend uses mock auth.' },
    { status: 501 }
  );
}
