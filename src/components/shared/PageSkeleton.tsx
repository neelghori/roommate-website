/**
 * Shared page loading skeleton used by all route loading.tsx files.
 * Renders a top-shimmer bar + a content skeleton that matches
 * the general layout of user pages.
 */

import React from 'react';

interface PageSkeletonProps {
  variant?: 'cards' | 'list' | 'chat' | 'profile' | 'generic';
}

export function PageSkeleton({ variant = 'generic' }: PageSkeletonProps) {
  return (
    <div className="min-h-screen bg-[#EDF5F5]" aria-busy="true" aria-label="Loading page">
      {/* Top bar placeholder */}
      <div className="fixed top-0 left-0 right-0 h-14 lg:h-16 bg-white border-b border-gray-100 z-50 flex items-center px-4 gap-4">
        {/* Logo shimmer */}
        <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse" />
        {/* Nav shimmer desktop */}
        <div className="hidden lg:flex gap-2 ml-4">
          {[64, 72, 88, 52, 56].map((w, i) => (
            <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" style={{ width: w }} />
          ))}
        </div>
        <div className="flex-1" />
        <div className="hidden lg:block h-9 w-52 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-9 w-24 bg-gray-100 rounded-full animate-pulse hidden lg:block" />
        <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Page content area */}
      <div className="pt-14 lg:pt-16 pb-20 lg:pb-8 px-4 sm:px-6 lg:px-10 xl:px-14">
        {variant === 'cards' && <CardsVariant />}
        {variant === 'list' && <ListVariant />}
        {variant === 'chat' && <ChatVariant />}
        {variant === 'profile' && <ProfileVariant />}
        {variant === 'generic' && <GenericVariant />}
      </div>

      {/* Bottom nav placeholder mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded bg-gray-200 animate-pulse" />
            <div className="w-8 h-2 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Variant skeletons ──────────────────────────────────────────────────────────

function CardsVariant() {
  return (
    <div className="max-w-[1440px] mx-auto py-4 space-y-4">
      {/* Banner skeleton */}
      <div className="h-24 rounded-2xl bg-teal-100 animate-pulse" />
      {/* Tabs */}
      <div className="flex gap-2">
        {[60, 48, 40, 72, 60].map((w, i) => (
          <div key={i} className="h-9 rounded-full bg-gray-200 animate-pulse" style={{ width: w }} />
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-44 bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListVariant() {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-2">
      {/* Header */}
      <div className="h-8 w-36 bg-gray-200 rounded-lg animate-pulse mb-4" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
          <div className="w-16 h-8 bg-gray-100 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

function ChatVariant() {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-1">
      <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-3" />
      <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse mb-2" />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 px-1 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-2.5 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="h-2.5 bg-gray-100 rounded w-10 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

function ProfileVariant() {
  return (
    <div className="max-w-2xl mx-auto py-6 space-y-4">
      <div className="flex flex-col items-center gap-3 py-8 animate-pulse">
        <div className="w-24 h-24 rounded-full bg-gray-200" />
        <div className="h-5 w-36 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-100 rounded" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 space-y-3 animate-pulse shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function GenericVariant() {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-4">
      <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 space-y-2 animate-pulse shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
