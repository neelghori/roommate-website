'use client';

/**
 * RouteProgressBar.tsx
 * Thin teal progress bar at the very top of the viewport.
 * Triggers on every route change (pathname change) for 600ms.
 *
 * Works with Next.js App Router by watching usePathname().
 * No external deps required pure CSS animation.
 */

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export const RouteProgressBar: React.FC = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any previous animation
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Start: reset width, make visible
    setWidth(0);
    setVisible(true);

    // Animate to ~80% quickly, then hold
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setWidth(80);
      });
    });

    // After a short hold, fill to 100% and fade out
    timerRef.current = setTimeout(() => {
      setWidth(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300);
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '3px',
        pointerEvents: 'none',
      }}
    >
      <div
        className="route-progress-bar bg-primary"
        style={{
          height: '100%',
          width: `${width}%`,
          transition: width === 100
            ? 'width 0.25s ease-out, opacity 0.3s ease-out'
            : 'width 0.5s cubic-bezier(0.1, 0.5, 0.5, 1)',
          opacity: width === 100 && !visible ? 0 : 1,
          boxShadow: '0 0 8px rgba(13, 148, 136, 0.7)',
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
};

RouteProgressBar.displayName = 'RouteProgressBar';
