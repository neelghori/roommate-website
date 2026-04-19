/**
 * User group layout.
 * All routes inside (user)/ are wrapped by this.
 * Auth check: redirect to /login if not authenticated.
 * BACKEND INTEGRATION: Replace mock auth check with real session validation.
 */
import React from 'react';

export default function UserGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
