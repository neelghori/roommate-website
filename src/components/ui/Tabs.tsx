/**
 * Tabs.tsx
 * Tab components for Roommat app.
 *
 * - Tabs: Pill/chip style tabs ("Student | Working | Veg Only")
 * - SegmentedTabs: Top navigation tabs ("All | Rent | PG | Roommates | Nearby")
 */
'use client';

import React, { useRef } from 'react';

export interface TabItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

// ─── Pill / Chip Tabs ────────────────────────────────────────────────────────

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
}) => {
  return (
    <div
      className={[
        'flex items-center gap-2 flex-wrap',
        className,
      ].join(' ')}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.value)}
            className={[
              'inline-flex items-center gap-1.5 font-medium rounded-full border transition-all duration-200',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
              isActive
                ? 'bg-primary text-white border-transparent'
                : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200',
              tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={[
                  'text-xs rounded-full px-1.5 py-0.5 leading-none font-bold',
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-300 text-gray-700',
                ].join(' ')}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── Segmented Tabs (top navigation style) ───────────────────────────────────

interface SegmentedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
  scrollable?: boolean;
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  scrollable = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className={[
        'flex items-center gap-1 bg-white border-b border-gray-100',
        scrollable ? 'overflow-x-auto scrollbar-hide' : '',
        className,
      ].join(' ')}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.value)}
            className={[
              'inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap',
              'border-b-2 transition-all duration-200 flex-shrink-0',
              isActive
                ? 'border-b-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
              tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={[
                  'text-xs rounded-full px-1.5 py-0.5 leading-none font-bold',
                  isActive ? 'text-white bg-primary' : 'bg-gray-200 text-gray-600',
                ].join(' ')}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
