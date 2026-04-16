/**
 * BottomNav.tsx
 * Mobile bottom navigation bar.
 * Active item uses primary teal color. Inactive uses gray.
 * Fixed at bottom of screen, above safe area.
 */
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Explore', href: '/explore', icon: Search },
  { label: 'Saved', href: '/saved', icon: Heart },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Profile', href: '/profile', icon: User },
] as const;

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[3.5rem] transition-colors"
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? '#1B8F8F' : '#9CA3AF' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? '#1B8F8F' : '#9CA3AF' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
