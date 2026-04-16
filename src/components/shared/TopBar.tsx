/**
 * TopBar.tsx
 * Top navigation bar for user pages.
 * Shows logo, search, notification bell, user avatar.
 */
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, User, Search, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { sanitizeSearchQuery } from '@/lib/utils/sanitize';

interface TopBarProps {
  /** Page suffix shown after logo, e.g. "Explore" */
  pageSuffix?: string;
  /** Whether to show the search bar */
  showSearch?: boolean;
  /** Whether to show the Add Listing button */
  showAddListing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  pageSuffix,
  showSearch = true,
  showAddListing = false,
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeSearchQuery(searchValue);
    if (sanitized) {
      router.push(`/explore?q=${encodeURIComponent(sanitized)}`);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-2 px-3 h-14 max-w-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <span className="text-xl font-black tracking-tight" style={{ color: '#1B8F8F' }}>
            Roommat
          </span>
          {pageSuffix && (
            <span className="text-xl font-light text-gray-500 ml-0.5">{pageSuffix}</span>
          )}
        </Link>

        {/* Search bar — only show when no pageSuffix */}
        {showSearch && !pageSuffix && (
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search location, area..."
                className="w-full pl-8 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-teal-400 focus:bg-white transition-colors"
                style={{ '--tw-ring-color': '#1B8F8F' } as React.CSSProperties}
                maxLength={200}
                autoComplete="off"
                aria-label="Search listings"
              />
            </div>
          </form>
        )}

        {/* Spacer when pageSuffix is shown */}
        {pageSuffix && <div className="flex-1" />}

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showAddListing && (
            <Link
              href="/listings/add"
              className="flex items-center gap-1 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#F57C00' }}
            >
              <Plus size={12} />
              Add Listing
            </Link>
          )}
          <Link href="/notifications" className="relative p-1.5 rounded-full hover:bg-gray-100">
            <Bell size={20} className="text-gray-600" />
            {/* Unread indicator — BACKEND INTEGRATION: conditionally show based on unread count */}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </Link>
          <Link href="/profile" className="p-1.5 rounded-full hover:bg-gray-100">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              {user?.avatarInitial ?? <User size={14} />}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
