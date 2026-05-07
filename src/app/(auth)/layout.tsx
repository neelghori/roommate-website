import React from 'react';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#EDF5F5' }}>
      {children}
    </div>
  );
}
