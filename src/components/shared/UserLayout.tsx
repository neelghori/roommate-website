/**
 * UserLayout.tsx
 * Shared layout for authenticated user pages.
 *
 * Mobile  : teal-tinted bg (#EDF5F5) + BottomNav + FAB
 * Desktop : white bg + no BottomNav + no FAB (header has "Add Listing")
 */
'use client';
import React from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Footer } from './Footer';

interface UserLayoutProps {
  children: React.ReactNode;
  pageSuffix?: string;
  showSearch?: boolean;
  showFab?: boolean;
}

export const UserLayout: React.FC<UserLayoutProps> = ({
  children,
  pageSuffix,
  showSearch = true,
  showFab = true,
}) => {
  return (
    // Mobile: teal app bg. Desktop: clean white.
    <div className="min-h-screen bg-[#EDF5F5] lg:bg-white flex flex-col">
      <TopBar pageSuffix={pageSuffix} showSearch={showSearch} />

      {/* pt-14 = mobile TopBar (56px)   lg:pt-16 = desktop TopBar (64px)
          pb-20 = BottomNav clearance    lg:pb-0  = clearing fixed bottom nav              */}
      <main className="flex-1 pt-14 lg:pt-16 pb-20 lg:pb-0 bg-[#EDF5F5] lg:bg-white">
        {children}
      </main>

      {/* Footer - Hidden on mobile to keep app-like feel, shown on desktop */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* FAB mobile only */}
      {showFab && (
        <Link
          href="/listings/add"
          className="lg:hidden fixed bottom-20 right-4 z-30 flex items-center gap-1.5 text-white font-semibold px-4 py-2.5 rounded-full shadow-lg active:opacity-90 transition-opacity bg-secondary"
          aria-label="Add new listing"
        >
          <Plus size={16} />
          <span className="text-sm">Add Listing</span>
        </Link>
      )}

      <BottomNav />
    </div>
  );
};
