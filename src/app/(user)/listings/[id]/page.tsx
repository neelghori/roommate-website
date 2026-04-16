'use client';

/**
 * Listing detail page — src/app/(user)/listings/[id]/page.tsx
 * Full detail view for a single listing, accessible via direct URL.
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  CheckCircle,
  BadgeCheck,
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
import { UserLayout } from '@/components/shared/UserLayout';
import { ListingCard } from '@/components/features/ListingCard';
import { ListingDetailModal } from '@/components/features/ListingDetailModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { MOCK_LISTINGS } from '@/mock/data';
import { useToast } from '@/hooks/useToast';
import { formatRupees } from '@/lib/utils/format';
import { Listing } from '@/types';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={15} />,
  AC: <Wind size={15} />,
  Kitchen: <UtensilsCrossed size={15} />,
  Food: <UtensilsCrossed size={15} />,
  Laundry: <ShoppingBag size={15} />,
  Parking: <Car size={15} />,
  Gym: <Dumbbell size={15} />,
  Security: <Shield size={15} />,
  'Power Backup': <Zap size={15} />,
  CCTV: <Eye size={15} />,
};

const BADGE_VARIANT_MAP: Record<string, 'hot' | 'limited' | 'new'> = {
  Hot: 'hot',
  'Limited Offer': 'limited',
  New: 'new',
};

const TYPE_COLORS: Record<string, string> = {
  PG: '#c8eeee',
  Rent: '#c8eeee',
  Roommate: '#cce8cc',
  Studio: '#e8dcc8',
  Bachelor: '#d8c8e8',
  Family: '#c8d8e8',
};

function maskPhone(phone: string): string {
  // e.g. "+91 9876501001" → "+91 98xxxxx001"
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return phone;
  const last3 = digits.slice(-3);
  const first2 = digits.slice(0, 2);
  return `+91 ${first2}xxxxx${last3}`;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);

  const id = params?.id as string;
  const listing = MOCK_LISTINGS.find((l) => l.id === id);

  // Similar listings: same type, excluding current
  const similarListings = MOCK_LISTINGS
    .filter((l) => l.id !== id && l.type === listing?.type)
    .slice(0, 3);

  if (!listing) {
    return (
      <UserLayout pageSuffix="Listing" showFab={false}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <EmptyState
            title="Listing not found"
            description="This listing may have been removed or the link is incorrect."
            actionLabel="Browse Listings"
            onAction={() => router.push('/')}
          />
        </div>
      </UserLayout>
    );
  }

  const cardBg = TYPE_COLORS[listing.type] ?? '#c8eeee';

  const handleApply = async () => {
    setIsApplying(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsApplying(false);
    toast.success('Application Sent!', `Your application for "${listing.title}" has been sent.`);
  };

  const handleBookVisit = async () => {
    setIsBooking(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsBooking(false);
    toast.success('Visit Booked!', 'The owner will contact you shortly.');
  };

  const ownerInitials = listing.ownerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <UserLayout pageSuffix="Listing Detail" showSearch={false} showFab={false}>
      <div className="max-w-2xl mx-auto pb-8">

        {/* ── Back button ────────────────────────────────────────── */}
        <div className="px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        </div>

        {/* ── Hero image / placeholder ───────────────────────────── */}
        <div
          className="relative w-full h-52 overflow-hidden"
          style={{ backgroundColor: cardBg }}
        >
          {listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg width="100" height="100" viewBox="0 0 80 80" fill="none" className="opacity-30">
                <rect x="10" y="30" width="60" height="40" rx="4" fill="#1B8F8F" opacity="0.5" />
                <rect x="20" y="20" width="40" height="50" rx="4" fill="#1B8F8F" opacity="0.6" />
                <rect x="30" y="10" width="20" height="60" rx="4" fill="#1B8F8F" opacity="0.7" />
                <rect x="32" y="50" width="16" height="20" rx="2" fill="white" opacity="0.5" />
              </svg>
            </div>
          )}

          {/* Badge overlay */}
          {listing.badge && (
            <div className="absolute top-3 left-3">
              <Badge variant={BADGE_VARIANT_MAP[listing.badge]}>{listing.badge}</Badge>
            </div>
          )}

          {/* Verified overlay */}
          {listing.isVerified && (
            <div
              className="absolute top-3 right-3 flex items-center gap-1 text-white text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              <BadgeCheck size={12} />
              Verified
            </div>
          )}
        </div>

        {/* ── Content ────────────────────────────────────────────── */}
        <div className="px-4 space-y-5 mt-4">

          {/* Title + price */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight mb-1">
              {listing.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <MapPin size={14} className="text-gray-400 flex-shrink-0" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-2xl font-bold" style={{ color: '#1B8F8F' }}>
                  {formatRupees(listing.price)}
                </span>
                <span className="text-sm text-gray-400 ml-1">/month</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                {listing.spotsLeft} spot{listing.spotsLeft !== 1 ? 's' : ''} left
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ backgroundColor: '#EDF5F5', color: '#1B8F8F' }}
              >
                {listing.genderPreference} pref.
              </span>
            </div>
          </div>

          {/* Amenities grid */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2">Amenities</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {listing.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100"
                >
                  <span style={{ color: '#1B8F8F' }}>{AMENITY_ICONS[amenity]}</span>
                  <span className="text-xs text-gray-600 leading-tight">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2">About this place</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
          </div>

          {/* Map placeholder */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2">Location</h2>
            <div
              className="w-full h-36 rounded-2xl flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: '#EDF5F5', border: '1.5px dashed #1B8F8F44' }}
            >
              <MapPin size={32} style={{ color: '#1B8F8F' }} />
              <p className="text-sm font-semibold" style={{ color: '#1B8F8F' }}>
                {listing.location}
              </p>
              <p className="text-xs text-gray-400">Map view coming soon</p>
            </div>
          </div>

          {/* Owner info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Property Owner</h2>
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                style={{ backgroundColor: '#1B8F8F' }}
              >
                {ownerInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{listing.ownerName}</p>
                <p className="text-xs text-gray-500">Property Owner</p>
                {listing.ownerPhone && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    📞 {maskPhone(listing.ownerPhone)}
                  </p>
                )}
              </div>
              {listing.isVerified && (
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-1">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isApplying}
              onClick={handleApply}
            >
              Apply Now
            </Button>
            <Button
              variant="accent"
              size="lg"
              fullWidth
              isLoading={isBooking}
              onClick={handleBookVisit}
            >
              Book Visit
            </Button>
          </div>

          {/* Similar listings */}
          {similarListings.length > 0 && (
            <div className="pt-2">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Similar Listings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarListings.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    onViewDetail={setPreviewListing}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick detail modal for similar listings */}
      <ListingDetailModal
        listing={previewListing}
        isOpen={!!previewListing}
        onClose={() => setPreviewListing(null)}
      />
    </UserLayout>
  );
}
