/**
 * format.ts
 * Formatting utilities for display values.
 */

import type { ListingType } from '@/types/listing.types';

const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  PG: 'PG',
  Rent: 'Rent',
  Flat: 'Flat',
  Roommate: 'Roommate',
  CoWorkingSpace: 'Co-Working Space',
  House: 'House',
};

/** Human-readable label for a listing type (e.g. `CoWorkingSpace` → "Co-Working Space"). */
export function formatListingTypeLabel(t: ListingType | string): string {
  if (t in LISTING_TYPE_LABELS) return LISTING_TYPE_LABELS[t as ListingType];
  return String(t);
}

/** Format a number as Indian Rupee currency */
export const formatRupees = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Format date to locale string */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/** Format relative time (e.g., "2 min ago") */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffSeconds = Math.floor((now - date) / 1000);
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hr ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
  } catch {
    return dateString;
  }
};

/** Truncate text to a max length */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/** Get initials from name */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/** Alias for formatRelativeTime used as timeAgo(dateString) */
export const timeAgo = formatRelativeTime;
