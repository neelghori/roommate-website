/**
 * User group layout — session bootstrap + gate: guests browse public routes;
 * protected routes redirect to /#browse; signed-in users see all routes.
 */
import React from 'react';
import { UserAuthGate } from '@/components/shared/UserAuthGate';

export default function UserGroupLayout({ children }: { children: React.ReactNode }) {
  return <UserAuthGate>{children}</UserAuthGate>;
}
