/**
 * User group layout.
 * All routes inside (user)/ are wrapped by this.
 * Auth check: redirect to /login if not authenticated.
 * BACKEND INTEGRATION: Replace mock auth check with real session validation.
 */
'use client';
import React from 'react';

// NOTE: In production, add auth guard here:
// const { isAuthenticated } = useAuthStore();
// if (!isAuthenticated) redirect('/login');

export default function UserGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
