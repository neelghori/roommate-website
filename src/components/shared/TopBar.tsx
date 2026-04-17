/**
 * TopBar.tsx
 * Auth-aware top navigation bar.
 *
 * - NOT logged in → Login + Register buttons on the right
 * - Logged in     → Bell icon + Avatar with dropdown (Profile, My Listings, Logout)
 *
 * Auth state: useAuthStore → { user, isAuthenticated, logout }
 */
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, User, Search, Plus, Home, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/modules/auth.service';
import { sanitizeSearchQuery } from '@/lib/utils/sanitize';
import { useToast } from '@/hooks/useToast';

interface TopBarProps {
  pageSuffix?: string;
  showSearch?: boolean;
  showAddListing?: boolean;
}

// ── Avatar Dropdown ────────────────────────────────────────────────────────────
const AvatarDropdown: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await authService.logout();
    logout();                        // clears store + sessionStorage
    toast.success('Logged out', 'See you soon!');
    router.push('/login');           // redirect → header re-renders unauthenticated
  };

  const MENU = [
    { icon: User,  label: 'Profile',     href: '/profile' },
    { icon: Home,  label: 'My Listings', href: '/my-listings' },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: '#1B8F8F' }}
        >
          {user?.avatarInitial ?? <User size={14} />}
        </div>
        <ChevronDown size={13} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-scale-in"
          role="menu"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>

          {/* Nav links */}
          {MENU.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon size={15} className="text-gray-400" />
              {label}
            </Link>
          ))}

          {/* Divider + Logout */}
          <div className="border-t border-gray-100">
            <button
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── TopBar ─────────────────────────────────────────────────────────────────────
export const TopBar: React.FC<TopBarProps> = ({
  pageSuffix,
  showSearch = true,
  showAddListing = false,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeSearchQuery(searchValue);
    if (sanitized) router.push(`/explore?q=${encodeURIComponent(sanitized)}`);
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

        {/* Search */}
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
                maxLength={200}
                autoComplete="off"
                aria-label="Search listings"
              />
            </div>
          </form>
        )}

        {pageSuffix && <div className="flex-1" />}

        {/* Right side — auth-aware */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showAddListing && (
            <Link
              href="/listings/add"
              className="flex items-center gap-1 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#F57C00' }}
            >
              <Plus size={12} /> Add Listing
            </Link>
          )}

          {isAuthenticated ? (
            /* ── LOGGED IN: bell + avatar dropdown ── */
            <>
              <Link href="/notifications" className="relative p-1.5 rounded-full hover:bg-gray-100" aria-label="Notifications">
                <Bell size={20} className="text-gray-600" />
                {/* BACKEND: show dot only when unread count > 0 */}
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </Link>
              <AvatarDropdown />
            </>
          ) : (
            /* ── NOT LOGGED IN: Login + Register buttons ── */
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-colors hover:bg-gray-50"
                style={{ borderColor: '#1B8F8F', color: '#1B8F8F' }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs font-semibold rounded-full text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#1B8F8F' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
