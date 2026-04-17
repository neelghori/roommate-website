'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, IndianRupee, Users, Trash2 } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { SAVED_LISTINGS } from '@/mock/data/users';
import { MOCK_LISTINGS } from '@/mock/data/listings';
import { Listing } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { formatRupees } from '@/lib/utils/format';

export default function SavedPage() {
  const { toast } = useToast();

  // Build saved listing data by joining ids
  const initialSaved = SAVED_LISTINGS
    .map((sl) => MOCK_LISTINGS.find((l) => l.id === sl.listingId))
    .filter((l): l is Listing => Boolean(l));

  const [savedListings, setSavedListings] = useState<Listing[]>(initialSaved);

  const handleRemove = (id: string) => {
    setSavedListings((prev) => prev.filter((l) => l.id !== id));
    toast.info('Removed from saved listings');
  };

  return (
    <UserLayout showSearch={false} showFab={false} pageSuffix="Saved">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">Saved Listings</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {savedListings.length} listing{savedListings.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {savedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No saved listings yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Tap the heart icon on any listing to save it here
          </p>
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: '#1B8F8F' }}
          >
            Explore Listings
          </Link>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-3">
          {savedListings.map((listing) => (
            <SavedListingCard
              key={listing.id}
              listing={listing}
              onRemove={() => handleRemove(listing.id)}
            />
          ))}
        </div>
      )}
    </UserLayout>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface SavedListingCardProps {
  listing: Listing;
  onRemove: () => void;
}

function SavedListingCard({ listing, onRemove }: SavedListingCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Image placeholder */}
      <div
        className="h-36 w-full relative"
        style={{ backgroundColor: '#EDF5F5' }}
      >
        {listing.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
        )}
        {/* Badge */}
        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: '#1B8F8F' }}
        >
          {listing.type}
        </span>
        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
          aria-label="Remove from saved"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <Link href={`/listings/${listing.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-teal-600 transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{listing.location}</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5" style={{ color: '#1B8F8F' }} />
            <span className="text-sm font-bold" style={{ color: '#1B8F8F' }}>
              {formatRupees(listing.price).replace('₹', '')}/mo
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-0.5">
              <Users className="w-3.5 h-3.5" />
              {listing.spotsLeft} spots left
            </div>
          </div>
        </div>

        <Link
          href={`/listings/${listing.id}`}
          className="mt-3 w-full flex items-center justify-center py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#1B8F8F' }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
