/**
 * ListingDetailModal.tsx
 * Full listing detail modal with image carousel, amenity chips,
 * description, location map placeholder, and CTA buttons.
 *
 * BACKEND INTEGRATION:
 * - Apply: POST /listings/{id}/apply
 * - Book Visit: POST /listings/{id}/book-visit
 */
'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  MapPin,
  Wifi,
  Wind,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Dumbbell,
  Shield,
  Zap,
  Eye,
  BadgeCheck,
} from 'lucide-react';
import { Listing } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { formatRupees } from '@/lib/utils/format';

// Amenity icon + label map
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={14} />,
  AC: <Wind size={14} />,
  Kitchen: <UtensilsCrossed size={14} />,
  Food: <UtensilsCrossed size={14} />,
  Laundry: <ShoppingBag size={14} />,
  Parking: <Car size={14} />,
  Gym: <Dumbbell size={14} />,
  Security: <Shield size={14} />,
  'Power Backup': <Zap size={14} />,
  CCTV: <Eye size={14} />,
};

const TYPE_COLORS: Record<string, string> = {
  PG: '#c8eeee',
  Rent: '#c8eeee',
  Roommate: '#cce8cc',
  Studio: '#e8dcc8',
  Bachelor: '#d8c8e8',
  Family: '#c8d8e8',
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
  const [currentImage, setCurrentImage] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const toast = useToast();

  // Reset carousel index when listing changes
  React.useEffect(() => {
    setCurrentImage(0);
  }, [listing?.id]);

  if (!listing) return null;

  const images = listing.images.length > 0 ? listing.images : [];
  const hasImages = images.length > 0;
  const cardBg = TYPE_COLORS[listing.type] ?? '#c8eeee';

  const prevImage = () =>
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const handleApply = async () => {
    setIsApplying(true);
    // BACKEND: await listingService.applyToListing(listing.id)
    await new Promise((r) => setTimeout(r, 900));
    setIsApplying(false);
    toast.success('Application Sent!', `Your application for ${listing.title} has been sent.`);
    onClose();
  };

  const handleBookVisit = async () => {
    setIsBooking(true);
    // BACKEND: await listingService.bookVisit(listing.id, date)
    await new Promise((r) => setTimeout(r, 900));
    setIsBooking(false);
    toast.success('Visit Booked!', 'The owner will contact you shortly.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false} className="!p-0">
      {/* ── Image Carousel ─────────────────────────────── */}
      <div
        className="relative h-56 w-full overflow-hidden rounded-t-2xl"
        style={{ backgroundColor: cardBg }}
      >
        {hasImages ? (
          <img
            src={images[currentImage]}
            alt={`${listing.title} — photo ${currentImage + 1}`}
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

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          aria-label="Close"
        >
          <span className="text-lg leading-none">&times;</span>
        </button>

        {/* Prev / Next arrows (only if multiple images) */}
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

        {/* Badge overlay */}
        {listing.badge && (
          <div className="absolute top-3 left-3">
            <Badge
              variant={
                listing.badge === 'Hot'
                  ? 'hot'
                  : listing.badge === 'Limited Offer'
                  ? 'limited'
                  : 'new'
              }
            >
              {listing.badge}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ────────────────────────────── */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={[
                'flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all',
                idx === currentImage ? 'border-teal-500' : 'border-transparent opacity-60',
              ].join(' ')}
              aria-label={`Go to photo ${idx + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Content ────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3 space-y-4">
        {/* Title + Price */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{listing.title}</h2>
            {listing.isVerified && (
              <div
                className="flex items-center gap-1 text-xs font-semibold text-white px-2 py-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: '#1B8F8F' }}
              >
                <BadgeCheck size={12} />
                Aadhar Verified
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <MapPin size={13} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-500">{listing.location}</span>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold" style={{ color: '#1B8F8F' }}>
              {formatRupees(listing.price)}
            </span>
            <span className="text-sm text-gray-400">/month</span>
          </div>
        </div>

        {/* Spots left */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-sm text-gray-600 font-medium">
            {listing.spotsLeft} spot{listing.spotsLeft !== 1 ? 's' : ''} left
          </span>
          <span className="text-xs text-gray-400 ml-1">
            · {listing.genderPreference} preference
          </span>
        </div>

        {/* Amenity chips */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {listing.amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600"
              >
                {AMENITY_ICONS[amenity]}
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1.5">About this place</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
        </div>

        {/* Owner info */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: '#1B8F8F' }}
          >
            {listing.ownerName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{listing.ownerName}</p>
            <p className="text-xs text-gray-500">Property Owner</p>
          </div>
          {listing.isVerified && (
            <CheckCircle size={16} className="ml-auto text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Map placeholder */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
          <div
            className="w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: '#EDF5F5', border: '1.5px dashed #1B8F8F33' }}
          >
            <MapPin size={28} style={{ color: '#1B8F8F' }} />
            <p className="text-sm font-medium" style={{ color: '#1B8F8F' }}>
              {listing.location}
            </p>
            <p className="text-xs text-gray-400">Map view coming soon</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            isLoading={isApplying}
            onClick={handleApply}
          >
            Apply Now
          </Button>
          <Button
            variant="accent"
            size="md"
            fullWidth
            isLoading={isBooking}
            onClick={handleBookVisit}
          >
            Book Visit
          </Button>
        </div>
      </div>
    </Modal>
  );
};
