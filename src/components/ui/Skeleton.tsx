/**
 * Skeleton.tsx
 * Loading skeleton components for listing cards, profile cards, etc.
 */
'use client';
import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  rounded = false,
  circle = false,
}) => (
  <div
    className={[
      'animate-pulse bg-gray-200',
      circle ? 'rounded-full' : rounded ? 'rounded-xl' : 'rounded',
      className,
    ].join(' ')}
  />
);

export const ListingCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
    <Skeleton className="h-40 w-full" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-5 w-1/2 rounded" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  </div>
);

export const ProfileCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
    <Skeleton className="h-12 w-12" circle />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/2 rounded" />
      <Skeleton className="h-3 w-1/3 rounded" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-12 h-12 rounded-full border-4 border-gray-200 animate-spin"
        style={{ borderTopColor: '#1B8F8F' }}
      />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);
