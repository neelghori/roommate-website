/**
 * AdminLayout.tsx
 * Admin panel layout with collapsible sidebar (mobile) / persistent sidebar (desktop).
 * Sidebar nav: Dashboard, Users, Listings, Reports, CMS Pages, Settings.
 * Active item highlighted in teal. Logout button at bottom of sidebar.
 */
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Home,
  Flag,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/modules/auth.service';
import { adminAuthService } from '@/services/modules/adminAuth.service';

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: { label: string; href: string; icon: React.ElementType; exact?: boolean }[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Listings', href: '/admin/listings', icon: Home },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'CMS Pages', href: '/admin/cms', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
] as const;

// ─── Sidebar content ──────────────────────────────────────────────────────────

interface SidebarProps {
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarProps> = ({ onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    adminAuthService.logout();
    await authService.logout();
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
          <Image
            src="/logo.png"
            alt="Roommat"
            width={100}
            height={32}
            className="h-7 w-auto object-contain"
            priority
          />
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest border-l border-gray-200 pl-2">
            Admin
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
        <div className="px-3 pb-3">
          <Link
            href="/admin-sign-in"
            onClick={onClose}
            className="text-xs font-medium text-teal-600 hover:underline"
          >
            Staff sign in
          </Link>
        </div>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  ].join(' ')}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                  <span>{label}</span>
                  {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-gray-100 p-3">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-primary"
            >
              {user.avatarInitial ?? user.name?.[0] ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// ─── AdminLayout ──────────────────────────────────────────────────────────────

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Derive page title from pathname
  const getPageTitle = () => {
    const found = NAV_ITEMS.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    );
    return found?.label ?? 'Admin';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:flex-col w-60 xl:w-64 bg-white border-r border-gray-100 flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl flex flex-col transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col lg:ml-60 xl:ml-64">
        {/* Admin top bar */}
        <header
          className="sticky top-0 z-20 bg-white border-b border-gray-100 flex items-center gap-3 px-4 h-14"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-base font-semibold text-gray-900">{getPageTitle()}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
