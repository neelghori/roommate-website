'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { ListingCard } from '@/components/features/ListingCard';
import { ListingDetailModal } from '@/components/features/ListingDetailModal';
import { EmptyState } from '@/components/shared/EmptyState';
import { listingService } from '@/services/modules/listing.service';
import { useToast } from '@/hooks/useToast';
import type { Listing } from '@/types';

export default function SavedListingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Listing | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listingService
      .getSavedListings()
      .then((rows) => {
        if (!cancelled) setListings(rows);
      })
      .catch((e) => {
        if (!cancelled) {
          setListings([]);
          toast.error('Could not load saved listings', e instanceof Error ? e.message : 'Try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavedChange = useCallback((listingId: string, saved: boolean) => {
    if (!saved) {
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setSelected((cur) => (cur?.id === listingId ? null : cur));
    }
  }, []);

  return (
    <UserLayout pageSuffix="Saved" showSearch={false} showFab={false}>
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 pb-safe">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={18} aria-hidden />
          Back to profile
        </Link>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Saved listings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Properties you saved — tap the heart on any card to remove from here.
        </p>

        {loading && (
          <p className="text-center text-sm text-gray-500 py-12">Loading…</p>
        )}

        {!loading && listings.length === 0 && (
          <EmptyState
            title="Nothing saved yet"
            description="Browse listings and tap the heart to save homes you like."
            actionLabel="Explore listings"
            onAction={() => router.push('/explore')}
          />
        )}

        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetail={() => setSelected(listing)}
                onSavedChange={handleSavedChange}
              />
            ))}
          </div>
        )}
      </div>

      <ListingDetailModal
        listing={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </UserLayout>
  );
}
