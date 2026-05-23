/**
 * ListingCard.tsx
 * Card component for displaying a property listing.
 * Responsive: compact on mobile, richer on tablet/desktop.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, MapPin } from 'lucide-react';
import { Listing } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { formatRentRange, formatListingTypeLabel } from '@/lib/utils/format';
import { formatFurnishingLabel } from '@/lib/furnishing';
import { ListingVerificationBadge } from '@/components/features/ListingVerificationBadge';
import { BookVisitModal } from '@/components/features/BookVisitModal';
import { useAuthStore } from '@/store/authStore';
import { listingService } from '@/services/modules/listing.service';
import { ListingAmenityIcon } from '@/components/features/ListingAmenityIcon';

const TYPE_COLORS: Record<string, string> = {
  PG: '#c8eeee',
  Rent: '#c8eeee',
  Flat: '#c8eeee',
  Roommate: '#cce8cc',
  CoWorkingSpace: '#e8dcc8',
  House: '#d8e0c8',
};

const BADGE_VARIANT_MAP: Record<string, 'hot' | 'limited' | 'new'> = {
  Hot: 'hot',
  'Limited Offer': 'limited',
  New: 'new',
  Featured: 'hot',
};

interface ListingCardProps {
  listing: Listing;
  onViewDetail?: (listing: Listing) => void;
  /** When save/unsave completes (for parent lists e.g. saved page). */
  onSavedChange?: (listingId: string, saved: boolean) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onViewDetail, onSavedChange }) => {
  const [isSaved, setIsSaved] = useState(listing.isSaved ?? false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const toast = useToast();
  const isOwnListing = Boolean(user?.id && listing.ownerId && String(user.id) === String(listing.ownerId));

  useEffect(() => {
    setIsSaved(listing.isSaved ?? false);
  }, [listing.id, listing.isSaved]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Sign in to save', 'Log in to add this listing to your saved homes.');
      router.push(`/login?next=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    if (isOwnListing) {
      toast.warning('Your listing', 'You cannot save your own property.');
      return;
    }
    setSaveBusy(true);
    try {
      if (isSaved) {
        await listingService.unsaveListing(listing.id);
        setIsSaved(false);
        setUser({
          ...user,
          shortlistedCount: Math.max(0, user.shortlistedCount - 1),
        });
        onSavedChange?.(listing.id, false);
        toast.success('Removed from saved');
      } else {
        await listingService.saveListing(listing.id);
        setIsSaved(true);
        setUser({
          ...user,
          shortlistedCount: user.shortlistedCount + 1,
        });
        onSavedChange?.(listing.id, true);
        toast.success('Saved to favourites');
      }
    } catch (err) {
      toast.error('Could not update', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setSaveBusy(false);
    }
  };

  const handleBookVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisitModalOpen(true);
  };

  const cardBg = TYPE_COLORS[listing.type] ?? '#c8eeee';

  return (
    <>
      <div
        className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
        onClick={() => onViewDetail?.(listing)}
        role="article"
        aria-label={`Listing: ${listing.title}`}
      >
        {/* ── Image ── */}
        <div className="relative h-44 overflow-hidden flex-shrink-0" style={{ backgroundColor: cardBg }}>
          {listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="opacity-40">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="10" y="30" width="60" height="40" rx="4" className="fill-primary/50" />
                  <rect x="20" y="20" width="40" height="50" rx="4" className="fill-primary/60" />
                  <rect x="30" y="10" width="20" height="60" rx="4" className="fill-primary/70" />
                  <rect x="32" y="50" width="16" height="20" rx="2" fill="white" opacity="0.5" />
                  {[0, 1, 2, 3].map((i) => (
                    <rect key={i} x={32 + i * 5} y="25" width="4" height="6" rx="1" fill="white" opacity="0.6" />
                  ))}
                </svg>
              </div>
            </div>
          )}

          {/* Type label */}
          <span
            className="absolute bottom-2 left-2 text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          >
            {formatListingTypeLabel(listing.type)}
          </span>

          {/* Badge */}
          {listing.badge && (
            <div className="absolute top-2 left-2">
              <Badge variant={BADGE_VARIANT_MAP[listing.badge]}>{listing.badge}</Badge>
            </div>
          )}

          {/* Heart */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saveBusy}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors disabled:opacity-60"
            aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
          >
            <Heart size={14} fill={isSaved ? '#EF4444' : 'none'} stroke={isSaved ? '#EF4444' : '#6B7280'} />
          </button>
        </div>

        {/* ── Card body ── */}
        <div className="p-3 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin size={11} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">{listing.location}</span>
          </div>
          {listing.furnishing ? (
            <p className="text-[10px] text-gray-500 mb-1">
              {formatFurnishingLabel(listing.furnishing)}
            </p>
          ) : null}
          {listing.peopleTypes && listing.peopleTypes.length > 0 ? (
            <p className="text-[10px] text-gray-500 mb-2">
              People: {listing.peopleTypes.join(' · ')}
            </p>
          ) : null}

          {/* Price + Verified */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-base font-bold text-primary">
                {formatRentRange(listing.price, listing.maxPrice)}
              </span>
              <span className="text-xs text-gray-400">/mo</span>
            </div>
            <ListingVerificationBadge listing={listing} variant="card" />
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {listing.amenities.slice(0, 4).map((chip) => (
              <div key={chip.name} className="flex items-center gap-0.5 text-gray-500 text-[11px]">
                <span className="text-primary shrink-0 inline-flex">
                  <ListingAmenityIcon chip={chip} size={11} iconClassName="h-3 w-3" />
                </span>
                <span>{chip.name}</span>
              </div>
            ))}
            {listing.amenities.length > 4 && (
              <span className="text-[11px] text-gray-400">+{listing.amenities.length - 4}</span>
            )}
          </div>

          {/* Spots */}
          <div className="flex items-center gap-1 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-xs text-gray-600">
              {listing.spotsLeft} spot{listing.spotsLeft !== 1 ? 's' : ''} left
            </span>
          </div>

          {/* CTA pushed to bottom */}
          <div className="mt-auto">
            <Button
              variant="accent"
              size="sm"
              fullWidth
              onClick={handleBookVisit}
              className="text-xs"
              disabled={isOwnListing}
              title={isOwnListing ? 'You cannot book your own listing' : undefined}
            >
              {isOwnListing ? 'Your listing' : 'Book Visit'}
            </Button>
          </div>
        </div>
      </div>
      <BookVisitModal
        listing={listing}
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
      />
    </>
  );
};
