/**
 * Auth group layout.
 * Centered card layout for login/register/forgot-password pages.
 */
import React from 'react';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-start sm:justify-center p-4 pt-8 pb-10 sm:py-10"
      style={{ backgroundColor: '#EDF5F5' }}
    >
      {children}
    </div>
  );
}
