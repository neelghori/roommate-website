/**
 * lib/auth.ts
 * Frontend-only auth stub.
 * BACKEND INTEGRATION: Replace with real NextAuth / JWT session handling.
 * This file exists only to satisfy type references during static build.
 */

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'OWNER' | 'ADMIN';
};

/** Mock: always returns null (no real session in frontend-only mode) */
export const getSession = async (): Promise<SessionUser | null> => null;
