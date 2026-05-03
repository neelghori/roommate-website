/**
 * ListingDetailModal.tsx
 * Mobile  : single-column scroll (unchanged)
 * Desktop : left sticky image + right scrollable details panel
 *
 * BACKEND INTEGRATION:
 * - Book Visit: POST /api/v1/bookings (see BookVisitModal)
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, MapPin, Users, X, MessageCircle } from 'lucide-react';
import { Listing } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupees, formatListingTypeLabel } from '@/lib/utils/format';
import { ListingVerificationBadge } from '@/components/features/ListingVerificationBadge';
import { ListingLocationMap } from '@/components/features/ListingLocationMap';
import { BookVisitModal } from '@/components/features/BookVisitModal';
import { useAuthStore } from '@/store/authStore';
import { ListingAmenityIcon } from '@/components/features/ListingAmenityIcon';

/** Tailwind arbitrary-value bg class per listing type no inline styles needed */
const TYPE_BG_CLASS: Record<string, string> = {
  PG: 'bg-[#c8eeee]',
  Rent: 'bg-[#c8eeee]',
  Flat: 'bg-[#c8eeee]',
  Roommate: 'bg-[#cce8cc]',
  CoWorkingSpace: 'bg-[#e8dcc8]',
  Bachelor: 'bg-[#d8c8e8]',
  Family: 'bg-[#c8d8e8]',
};

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [visitBookingOpen, setVisitBookingOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isOwnListing = Boolean(
    user?.id && listing?.ownerId && String(user.id) === String(listing?.ownerId),
  );
  const ownerChatPath = listing?.ownerId ? `/chat/${listing.ownerId}` : '';

  const handleMessageOwner = () => {
    if (!ownerChatPath) return;
    if (!user?.id) {
      router.push(`/login?next=${encodeURIComponent(ownerChatPath)}`);
      onClose();
      return;
    }
    router.push(ownerChatPath);
    onClose();
  };

  React.useEffect(() => {
    setCurrentImage(0);
  }, [listing?.id]);

  if (!listing) return null;

  const images = listing.images.length > 0 ? listing.images : [];
  const hasImages = images.length > 0;
  const typeBgCls = TYPE_BG_CLASS[listing.type] ?? 'bg-[#c8eeee]';
  const prevImage = () =>
    setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1));
  const nextImage = () =>
    setCurrentImage((p) => (p === images.length - 1 ? 0 : p + 1));

  const handleBookVisit = () => {
    setVisitBookingOpen(true);
  };

  const ownerInitials = listing.ownerName
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        showCloseButton={false}
        className="!p-0"
      >
        {/* ══════════════════════════════════════════════════
          DESKTOP: 2-column grid  |  MOBILE: single column
          ══════════════════════════════════════════════════ */}
        <div className="lg:grid lg:grid-cols-[420px_1fr] lg:min-h-[560px]">

          {/* ── LEFT: Image + Thumbnails (sticky on desktop) ── */}
          <div className="lg:sticky lg:top-0 lg:self-start flex flex-col">

            {/* Carousel */}
            <div
              className={`relative h-56 lg:h-[380px] w-full overflow-hidden rounded-t-2xl lg:rounded-tr-none lg:rounded-bl-2xl ${typeBgCls}`}
            >
              {hasImages ? (
                <img
                  src={images[currentImage]}
                  alt={`${listing.title} photo ${currentImage + 1}`}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  decoding="async"
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

              {/* Close visible on mobile inside image; desktop has its own close */}
              <button
                onClick={onClose}
                className="lg:hidden absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Prev / Next arrows */}
              {hasImages && images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Badge */}
              {listing.badge && (
                <div className="absolute top-3 left-3">
                  <Badge variant={listing.badge === 'Hot' ? 'hot' : listing.badge === 'Limited Offer' ? 'limited' : 'new'}>
                    {listing.badge}
                  </Badge>
                </div>
              )}

              {/* Image counter pill */}
              {hasImages && images.length > 1 && (
                <div className="absolute bottom-3 right-3 text-xs font-semibold text-white px-2.5 py-1 rounded-full bg-black/45">
                  {currentImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {hasImages && images.length > 1 && (
              <div className="flex gap-2 px-3 py-2.5 overflow-x-auto bg-gray-50 lg:rounded-bl-2xl">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={[
                      'flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all',
                      idx === currentImage ? 'border-teal-500 opacity-100' : 'border-transparent opacity-55 hover:opacity-80',
                    ].join(' ')}
                    aria-label={`Go to photo ${idx + 1}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Desktop: type + verified badges under image */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
              <span
                className="text-xs font-bold text-white px-2.5 py-1 rounded-full bg-primary"
              >
                {formatListingTypeLabel(listing.type)}
              </span>
              <ListingVerificationBadge listing={listing} variant="modalDesktopPill" />
              <span className="ml-auto text-xs text-gray-500">
                <Users size={12} className="inline mr-1 mb-0.5" />
                {listing.spotsLeft} spot{listing.spotsLeft !== 1 ? 's' : ''} left
              </span>
            </div>
          </div>

          {/* ── RIGHT: Details panel ── */}
          <div className="flex flex-col">

            {/* Desktop header bar with close button */}
            <div className="hidden lg:flex items-start justify-between px-6 pt-5 pb-3">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{listing.title}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{listing.location}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 px-5 lg:px-6 pb-4 pt-4 lg:pt-0 space-y-4 overflow-y-auto">

              {/* Mobile: title + location */}
              <div className="lg:hidden">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{listing.title}</h2>
                  <ListingVerificationBadge listing={listing} variant="modalMobilePill" />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{listing.location}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {formatRupees(listing.price)}
                </span>
                <span className="text-sm text-gray-400">/month</span>
                <span
                  className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-primary"
                >
                  {listing.genderPreference} pref.
                </span>
              </div>

              {/* Mobile: spots left */}
              <div className="lg:hidden flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 font-medium">
                  {listing.spotsLeft} spot{listing.spotsLeft !== 1 ? 's' : ''} left
                </span>
              </div>

              {/* Divider */}
              <hr className="border-gray-100" />

              {/* Amenities */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2.5">Amenities</h3>
                {listing.amenities.length === 0 ? (
                  <p className="text-sm text-gray-500">No amenities listed for this place.</p>
                ) : (
                  <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                    {listing.amenities.map((chip) => (
                      <div
                        key={chip.name}
                        className="flex flex-col items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center"
                      >
                        <span className="text-primary inline-flex">
                          <ListingAmenityIcon chip={chip} size={14} iconClassName="h-4 w-4" />
                        </span>
                        <span className="text-[11px] text-gray-600 leading-tight">{chip.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1.5">About this place</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
              </div>

              {/* Owner info */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-primary"
                >
                  {ownerInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{listing.ownerName}</p>
                  <p className="text-xs text-gray-500">Property Owner</p>
                </div>
                <ListingVerificationBadge listing={listing} variant="ownerIconOnly" />
              </div>

              {/* Map Google embed iframe from lat/lng (no API key) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
                <ListingLocationMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  locationLabel={listing.location}
                  minHeightClass="min-h-[180px] lg:min-h-[200px]"
                  roundedClass="rounded-xl"
                  embedHeightClass="h-[180px] sm:h-[200px] lg:h-[220px]"
                />
              </div>
            </div>

            {/* CTA pinned to bottom of right panel */}
            <div className="px-5 lg:px-6 py-4 border-t border-gray-100 bg-white rounded-br-2xl space-y-2">
              {!isOwnListing && ownerChatPath ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={handleMessageOwner}
                >
                  <MessageCircle size={16} className="inline mr-2 -mt-0.5 align-middle" aria-hidden />
                  Message owner
                </Button>
              ) : null}
              <Button
                variant="accent"
                size="md"
                fullWidth
                onClick={handleBookVisit}
                disabled={isOwnListing}
                title={isOwnListing ? 'You cannot book your own listing' : undefined}
              >
                {isOwnListing ? 'Your listing' : 'Book Visit'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <BookVisitModal
        listing={listing}
        isOpen={visitBookingOpen}
        onClose={() => setVisitBookingOpen(false)}
      />
    </>
  );
};
