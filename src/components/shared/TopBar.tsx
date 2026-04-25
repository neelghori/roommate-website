/**
 * TopBar.tsx
 * Full-width, desktop-first navigation bar.
 *
 * Mobile  : Logo + conditional search + auth icons
 * Desktop : Logo + horizontal nav + search bar + "Add Listing" + avatar dropdown
 *
 * Nav links always visible on desktop regardless of auth state.
 * Auth state: useAuthStore → { user, isAuthenticated, logout }
 */
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell, User, Search, Plus, Home, LogOut, ChevronDown, KeyRound,
  Compass, Heart, MessageCircle, Users, Star, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/modules/auth.service';
import { sanitizeSearchQuery } from '@/lib/utils/sanitize';
import { useToast } from '@/hooks/useToast';

interface TopBarProps {
  pageSuffix?: string;
  showSearch?: boolean;
  showAddListing?: boolean;
}

// Desktop horizontal nav items
const DESKTOP_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Roommates', href: '/roommates' },
  { label: 'Chat', href: '/chat' },
  { label: 'Saved', href: '/saved' },
] as const;

// ── Avatar Dropdown ────────────────────────────────────────────────────────────
const AvatarDropdown: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await authService.logout();
    logout();
    toast.success('Logged out', 'See you soon!');
    router.push('/');
  };

  const MENU = [
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: KeyRound, label: 'Change password', href: '/profile/change-password' },
    { icon: Home, label: 'My Listings', href: '/my-listings' },
  ];

  const initials = user?.avatarInitial ?? user?.name?.slice(0, 2).toUpperCase() ?? 'GU';

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {/* Avatar circle */}
        <div
          className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm bg-primary"
        >
          {initials}
        </div>
        <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {user?.name?.split(' ')[0] ?? 'Account'}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform hidden lg:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-scale-in"
          role="menu"
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name ?? 'Guest User'}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{user?.role?.toLowerCase() ?? 'tenant'}</p>
          </div>

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

// ── Notification Popover ──────────────────────────────────────────────────────
const NotificationPopover: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  const NOTIFICATIONS = [
    { id: '1', title: 'New message from Ravi Sharma', subtitle: 'Hey! Is the room in Satellite...', time: '2 min ago', read: false, category: 'message' },
    { id: '2', title: 'Roommate match found!', subtitle: 'Priya M. matches 92% of your preferences.', time: '15 min ago', read: false, category: 'match' },
    { id: '3', title: 'Your listing was approved', subtitle: '2BHK in Bodakdev has been published.', time: '1 hr ago', read: false, category: 'listing' },
  ];

  const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    message: { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' },
    match: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
    listing: { icon: Home, color: 'text-primary', bg: 'bg-primary/10' },
    system: { icon: Bell, color: 'text-secondary', bg: 'bg-secondary/10' },
  };

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      router.push('/notifications');
    } else {
      setOpen(!open);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="relative p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={20} className="text-gray-600" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white shadow-sm" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-scale-in">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            <button className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors">
              Mark all read
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {NOTIFICATIONS.length > 0 ? (
              NOTIFICATIONS.map((n) => {
                const config = categoryConfig[n.category] || categoryConfig.system;
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                  >
                    <div
                      className={['flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5', config.bg].join(' ')}
                    >
                      <Icon size={14} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 leading-tight mb-0.5">{n.title}</p>
                      <p className="text-[11px] text-gray-500 truncate">{n.subtitle}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center px-4">
                <p className="text-sm text-gray-400">No new notifications</p>
              </div>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block py-3 text-center text-xs font-bold text-primary hover:bg-gray-50 border-t border-gray-50 transition-colors uppercase tracking-wider"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

// ── TopBar ─────────────────────────────────────────────────────────────────────
export const TopBar: React.FC<TopBarProps> = ({
  pageSuffix,
  showSearch = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');

  const isNavActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = sanitizeSearchQuery(searchValue);
    if (q) router.push(`/explore?q=${encodeURIComponent(q)}`);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
    >
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-10 xl:px-14 h-14 lg:h-16">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <Image
            src="/logo.png"
            alt="Roommat"
            width={110}
            height={36}
            className="h-8 lg:h-9 w-auto object-contain"
            priority
          />
          {pageSuffix && (
            <span className="text-sm font-medium text-gray-400 border-l border-gray-200 pl-2 lg:hidden">
              {pageSuffix}
            </span>
          )}
        </Link>

        {/* ── Desktop horizontal nav — ALWAYS visible ── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-shrink-0" aria-label="Main navigation">
          {DESKTOP_NAV.map(({ label, href }) => {
            const active = isNavActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  active
                    ? 'font-semibold bg-teal-50 text-primary'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Search ──
            Mobile: visible only when showSearch=true
            Desktop: always shown, expands to fill space  ── */}
        <form
          onSubmit={handleSearch}
          className={[
            'flex-1',
            showSearch ? 'block' : 'hidden lg:block',
          ].join(' ')}
        >
          <div className="relative max-w-md lg:max-w-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search location, area…"
              className="w-full pl-9 pr-4 py-2 lg:py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary focus:bg-white transition-colors"
              maxLength={200}
              autoComplete="off"
              aria-label="Search listings"
            />
          </div>
        </form>

        {/* Spacer when no search on mobile */}
        {!showSearch && pageSuffix && <div className="flex-1 lg:hidden" />}

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          {/* "Add Listing" — desktop only in header */}
          <Link
            href="/listings/add"
            className="hidden lg:flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90 whitespace-nowrap bg-secondary"
          >
            <Plus size={14} />
            Add Listing
          </Link>

          {isAuthenticated ? (
            <>
              {/* Notifications bell */}
              <NotificationPopover />

              {/* Avatar */}
              <AvatarDropdown />
            </>
          ) : (
            /* Unauthenticated — Login + Register */
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-colors hover:bg-gray-50 border-primary text-primary"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs font-semibold rounded-full text-white transition-opacity hover:opacity-90 bg-primary"
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
