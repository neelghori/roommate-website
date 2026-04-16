/**
 * ListingCard.tsx
 * Card component for displaying a property listing.
 * Matches the mockup exactly:
 * - Image/placeholder at top with badge overlay
 * - Heart save button overlay
 * - Property info below
 * - Two CTA buttons: Apply Now + Book Visit
 *
 * BACKEND INTEGRATION: onClick handlers call listing.service.ts methods.
 * Expected API: POST /listings/{id}/apply, POST /listings/{id}/book-visit
 */
'use client';

import React, { useState } from 'react';
import {
  Heart,
  CheckCircle,
  Wifi,
  Wind,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Dumbbell,
  Shield,
  Zap,
  Eye,
} from 'lucide-react';
import { Listing } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { formatRupees } from '@/lib/utils/format';
import { escapeHtml } from '@/lib/utils/sanitize';

// Amenity icon map
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={11} />,
  AC: <Wind size={11} />,
  Kitchen: <UtensilsCrossed size={11} />,
  Food: <UtensilsCrossed size={11} />,
  Laundry: <ShoppingBag size={11} />,
  Parking: <Car size={11} />,
  Gym: <Dumbbell size={11} />,
  Security: <Shield size={11} />,
  'Power Backup': <Zap size={11} />,
  CCTV: <Eye size={11} />,
};

// Property type placeholder background color
const TYPE_COLORS: Record<string, string> = {
  PG: '#c8eeee',
  Rent: '#c8eeee',
  Roommate: '#cce8cc',
  Studio: '#e8dcc8',
  Bachelor: '#d8c8e8',
  Family: '#c8d8e8',
};

// Badge variant map
const BADGE_VARIANT_MAP: Record<string, 'hot' | 'limited' | 'new'> = {
  Hot: 'hot',
  'Limited Offer': 'limited',
  New: 'new',
};

interface ListingCardProps {
  listing: Listing;
  onViewDetail?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onViewDetail }) => {
  const [isSaved, setIsSaved] = useState(listing.isSaved ?? false);
  const [isApplying, setIsApplying] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const toast = useToast();

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved((prev) => !prev);
    // BACKEND: await listingService.saveListing(listing.id) / unsaveListing
    toast.success(isSaved ? 'Removed from saved' : 'Saved to favourites!');
  };

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApplying(true);
    // MOCK: Simulate API call
    // BACKEND: await listingService.applyToListing(listing.id)
    await new Promise((r) => setTimeout(r, 800));
    setIsApplying(false);
    toast.success(
      'Application Sent!',
      `Your application for ${escapeHtml(listing.title)} has been sent.`
    );
  };

  const handleBookVisit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBooking(true);
    // BACKEND: await listingService.bookVisit(listing.id, date)
    await new Promise((r) => setTimeout(r, 800));
    setIsBooking(false);
    toast.success('Visit Booked!', 'The owner will contact you shortly.');
  };

  const cardBg = TYPE_COLORS[listing.type] ?? '#c8eeee';

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewDetail?.(listing)}
      role="article"
      aria-label={`Listing: ${listing.title}`}
    >
      {/* Image / Placeholder */}
      <div className="relative h-36 overflow-hidden" style={{ backgroundColor: cardBg }}>
        {listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          /* Placeholder building illustration */
          <div className="flex items-center justify-center h-full">
            <div className="opacity-40">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="10" y="30" width="60" height="40" rx="4" fill="#1B8F8F" opacity="0.5" />
                <rect x="20" y="20" width="40" height="50" rx="4" fill="#1B8F8F" opacity="0.6" />
                <rect x="30" y="10" width="20" height="60" rx="4" fill="#1B8F8F" opacity="0.7" />
                <rect x="32" y="50" width="16" height="20" rx="2" fill="white" opacity="0.5" />
                {[0, 1, 2, 3].map((i) => (
                  <rect
                    key={i}
                    x={32 + i * 5}
                    y="25"
                    width="4"
                    height="6"
                    rx="1"
                    fill="white"
                    opacity="0.6"
                  />
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* Badge */}
        {listing.badge && (
          <div className="absolute top-2 left-2">
            <Badge variant={BADGE_VARIANT_MAP[listing.badge]}>{listing.badge}</Badge>
          </div>
        )}

        {/* Save / Heart button */}
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
        >
          <Heart
            size={14}
            fill={isSaved ? '#EF4444' : 'none'}
            stroke={isSaved ? '#EF4444' : '#6B7280'}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">
          {listing.title}
        </h3>

        {/* Price + Verified */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-base font-bold" style={{ color: '#1B8F8F' }}>
              {formatRupees(listing.price)}
            </span>
            <span className="text-xs text-gray-400">/mo</span>
          </div>
          {listing.isVerified && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle size={12} />
              Verified
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {listing.amenities.slice(0, 3).map((amenity) => (
            <div key={amenity} className="flex items-center gap-0.5 text-gray-500 text-[11px]">
              {AMENITY_ICONS[amenity]}
              <span>{amenity}</span>
            </div>
          ))}
        </div>

        {/* Spots left */}
        <div className="flex items-center gap-1 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-xs text-gray-600">
            {listing.spotsLeft} spot{listing.spotsLeft !== 1 ? 's' : ''} left
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            isLoading={isApplying}
            onClick={handleApply}
            className="text-xs"
          >
            Apply Now
          </Button>
          <Button
            variant="accent"
            size="sm"
            fullWidth
            isLoading={isBooking}
            onClick={handleBookVisit}
            className="text-xs"
          >
            Book Visit
          </Button>
        </div>
      </div>
    </div>
  );
};
