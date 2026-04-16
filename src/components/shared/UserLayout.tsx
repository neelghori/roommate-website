/**
 * UserLayout.tsx
 * Shared layout wrapper for all authenticated user pages.
 * Renders TopBar at top, content with proper padding, BottomNav at bottom.
 * The "+ Add Listing" FAB floats above bottom nav.
 */
'use client';
import React from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface UserLayoutProps {
  children: React.ReactNode;
  /** Page name shown after "Roommat" in top bar, e.g. "Explore" */
  pageSuffix?: string;
  /** Whether to show the search bar in the top bar */
  showSearch?: boolean;
  /** Whether to show the floating "+ Add Listing" action button */
  showFab?: boolean;
}

export const UserLayout: React.FC<UserLayoutProps> = ({
  children,
  pageSuffix,
  showSearch = true,
  showFab = true,
}) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF5F5' }}>
      <TopBar pageSuffix={pageSuffix} showSearch={showSearch} />

      {/* Main content — padded for top bar (56px) + bottom nav (80px) */}
      <main
        className="pt-14 pb-20 min-h-screen"
        style={{ backgroundColor: '#EDF5F5' }}
      >
        {children}
      </main>

      {/* Floating Action Button — sits above bottom nav */}
      {showFab && (
        <Link
          href="/listings/add"
          className="fixed bottom-20 right-4 z-30 flex items-center gap-1.5 text-white font-semibold px-4 py-2.5 rounded-full shadow-lg active:opacity-90 transition-opacity"
          style={{ backgroundColor: '#F57C00' }}
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
