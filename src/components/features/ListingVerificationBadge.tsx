'use client';

/**
 * Listing trust UI staff-approved listings show a profile-style “Company verified” pill
 * (Building2 + orange); ID/property/premium badges and `isVerified` use the default pill.
 */
import { BadgeCheck, CheckCircle } from 'lucide-react';
import type { Listing } from '@/types';
import {
  listingHasVerification,
  listingVerificationCompanyStyle,
  listingVerificationLabel,
} from '@/services/modules/listing.service';

/** Meta / Instagram official account verified blue */
const META_VERIFIED = '#0095F6';

export type ListingVerificationPick = Pick<Listing, 'isVerified' | 'verificationBadge' | 'approvalStatus'>;

export type ListingVerificationBadgeProps = {
  listing: ListingVerificationPick;
} & (
    | { variant: 'card' }
    | { variant: 'heroOverlay' }
    | { variant: 'inlinePill' }
    | { variant: 'ownerIconOnly' }
    | { variant: 'modalDesktopPill' }
    | { variant: 'modalMobilePill' }
  );

export function ListingVerificationBadge(props: ListingVerificationBadgeProps) {
  const { listing, variant } = props;
  if (!listingHasVerification(listing)) return null;
  const company = listingVerificationCompanyStyle(listing);
  const label = listingVerificationLabel(listing);

  if (variant === 'card') {
    return (
      <div
        className={
          company
            ? 'flex max-w-[48%] items-center gap-1 text-xs font-semibold'
            : 'flex max-w-[48%] items-center gap-1 text-xs font-medium text-green-600'
        }
        style={company ? { color: META_VERIFIED } : undefined}
      >
        {company ? (
          <BadgeCheck size={12} className="shrink-0" style={{ color: META_VERIFIED }} aria-hidden />
        ) : (
          <CheckCircle size={12} className="shrink-0" aria-hidden />
        )}
        <span className="truncate">{label}</span>
      </div>
    );
  }

  if (variant === 'heroOverlay') {
    return (
      <div
        className={
          company
            ? 'absolute top-3 right-3 z-10 flex max-w-[min(200px,calc(100%-5rem))] items-center gap-1 rounded-full border border-[#0095F6]/35 bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-[2px]'
            : 'absolute top-3 right-3 z-10 flex max-w-[min(200px,calc(100%-5rem))] items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white'
        }
        style={company ? { color: META_VERIFIED } : { backgroundColor: '#1B8F8F' }}
      >
        {company ? (
          <BadgeCheck size={12} className="shrink-0" style={{ color: META_VERIFIED }} aria-hidden />
        ) : (
          <BadgeCheck size={12} className="shrink-0" aria-hidden />
        )}
        <span className="truncate">{label}</span>
      </div>
    );
  }

  if (variant === 'inlinePill') {
    return (
      <div
        className={
          company
            ? 'mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#0095F6]/30 bg-blue-50/90 px-2.5 py-1 text-xs font-semibold'
            : 'mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white'
        }
        style={company ? { color: META_VERIFIED } : { backgroundColor: '#1B8F8F' }}
      >
        {company ? (
          <BadgeCheck size={12} className="shrink-0" style={{ color: META_VERIFIED }} aria-hidden />
        ) : (
          <BadgeCheck size={12} className="shrink-0" aria-hidden />
        )}
        <span>{label}</span>
      </div>
    );
  }

  if (variant === 'ownerIconOnly') {
    return (
      <span className={company ? 'shrink-0' : 'shrink-0 text-green-500'} title={label}>
        {company ? (
          <BadgeCheck size={18} className="shrink-0" style={{ color: META_VERIFIED }} aria-hidden />
        ) : (
          <CheckCircle size={18} className="shrink-0" aria-hidden />
        )}
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  if (variant === 'modalDesktopPill') {
    return (
      <span
        className={
          company
            ? 'flex max-w-[200px] items-center gap-1 rounded-full border border-[#0095F6]/30 bg-blue-50 px-2.5 py-1 text-xs font-semibold'
            : 'flex max-w-[200px] items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white'
        }
        style={company ? { color: META_VERIFIED } : undefined}
      >
        {company ? (
          <BadgeCheck size={11} className="shrink-0" style={{ color: META_VERIFIED }} aria-hidden />
        ) : (
          <BadgeCheck size={11} className="shrink-0" aria-hidden />
        )}
        <span className="truncate">{label}</span>
      </span>
    );
  }

  if (variant === 'modalMobilePill') {
    return (
      <div
        className={
          company
            ? 'flex max-w-[min(200px,45%)] shrink-0 items-center gap-1 rounded-full border border-[#0095F6]/30 bg-blue-50 px-2 py-1 text-xs font-semibold'
            : 'flex max-w-[min(200px,45%)] shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white'
        }
        style={company ? { color: META_VERIFIED } : undefined}
      >
        {company ? (
          <BadgeCheck size={12} className="shrink-0" style={{ color: META_VERIFIED }} aria-hidden />
        ) : (
          <BadgeCheck size={12} className="shrink-0" aria-hidden />
        )}
        <span className="truncate">{label}</span>
      </div>
    );
  }

  return null;
}
