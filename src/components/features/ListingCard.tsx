/**
 * ListingCard.tsx
 * Card component for displaying a property listing.
 * Responsive: compact on mobile, richer on tablet/desktop.
 */
'use client';

import React, { useState } from 'react';
import {
  Heart, CheckCircle, MapPin,
  Wifi, Wind, UtensilsCrossed, ShoppingBag,
  Car, Dumbbell, Shield, Zap, Eye,
} from 'lucide-react';
import { Listing } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { formatRupees } from '@/lib/utils/format';
import { escapeHtml } from '@/lib/utils/sanitize';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi:          <Wifi size={11} />,
  AC:            <Wind size={11} />,
  Kitchen:       <UtensilsCrossed size={11} />,
  Food:          <UtensilsCrossed size={11} />,
  Laundry:       <ShoppingBag size={11} />,
  Parking:       <Car size={11} />,
  Gym:           <Dumbbell size={11} />,
  Security:      <Shield size={11} />,
  'Power Backup': <Zap size={11} />,
  CCTV:          <Eye size={11} />,
};

const TYPE_COLORS: Record<string, string> = {
  PG:       '#c8eeee',
  Rent:     '#c8eeee',
  Roommate: '#cce8cc',
  Studio:   '#e8dcc8',
  Bachelor: '#d8c8e8',
  Family:   '#c8d8e8',
};

const BADGE_VARIANT_MAP: Record<string, 'hot' | 'limited' | 'new'> = {
  Hot:            'hot',
  'Limited Offer':'limited',
  New:            'new',
};

interface ListingCardProps {
  listing: Listing;
  onViewDetail?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onViewDetail }) => {
  const [isSaved, setIsSaved]     = useState(listing.isSaved ?? false);
  const [isApplying, setIsApplying] = useState(false);
  const [isBooking, setIsBooking]   = useState(false);
  const toast = useToast();

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved((prev) => !prev);
    toast.success(isSaved ? 'Removed from saved' : 'Saved to favourites!');
  };

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApplying(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsApplying(false);
    toast.success('Application Sent!', `Your application for ${escapeHtml(listing.title)} has been sent.`);
  };

  const handleBookVisit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBooking(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsBooking(false);
    toast.success('Visit Booked!', 'The owner will contact you shortly.');
  };

  const cardBg = TYPE_COLORS[listing.type] ?? '#c8eeee';

  return (
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
          {listing.type}
        </span>

        {/* Badge */}
        {listing.badge && (
          <div className="absolute top-2 left-2">
            <Badge variant={BADGE_VARIANT_MAP[listing.badge]}>{listing.badge}</Badge>
          </div>
        )}

        {/* Heart */}
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
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

        {/* Price + Verified */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-base font-bold text-primary">
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
          {listing.amenities.slice(0, 4).map((amenity) => (
            <div key={amenity} className="flex items-center gap-0.5 text-gray-500 text-[11px]">
              {AMENITY_ICONS[amenity]}
              <span>{amenity}</span>
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

        {/* CTA Buttons — pushed to bottom */}
        <div className="flex gap-2 mt-auto">
          <Button variant="secondary" size="sm" fullWidth isLoading={isApplying} onClick={handleApply} className="text-xs">
            Apply Now
          </Button>
          <Button variant="accent" size="sm" fullWidth isLoading={isBooking} onClick={handleBookVisit} className="text-xs">
            Book Visit
          </Button>
        </div>
      </div>
    </div>
  );
};
