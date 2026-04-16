/**
 * Auth group layout.
 * Centered card layout for login/register/forgot-password pages.
 */
import React from 'react';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#EDF5F5' }}
    >
      {children}
    </div>
  );
}
