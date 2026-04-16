'use client';

/**
 * Homepage — src/app/(user)/page.tsx
 * Main landing page with listings, filters, category tabs, sidebar panels.
 */

import React, { useState, useMemo } from 'react';
import { MapIcon } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { ListingCard } from '@/components/features/ListingCard';
import { ListingDetailModal } from '@/components/features/ListingDetailModal';
import { FilterPanel } from '@/components/features/FilterPanel';
import { RoommateFinderPanel } from '@/components/features/RoommateFinderPanel';
import { ReferralBanner } from '@/components/features/ReferralBanner';
import { AddListingModal } from '@/components/features/AddListingModal';
import { SegmentedTabs } from '@/components/ui/Tabs';
import { MOCK_LISTINGS } from '@/mock/data';
import { Listing } from '@/types';

const CATEGORY_TABS = [
  { label: 'All', value: 'All' },
  { label: 'Rent', value: 'Rent' },
  { label: 'PG', value: 'PG' },
  { label: 'Roommate', value: 'Roommate' },
  { label: 'Nearby', value: 'Nearby' },
];

const PAGE_SIZE = 6;

export default function HomePage() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [showAddListing, setShowAddListing] = useState(false);
  const [page, setPage] = useState(0);

  const filteredListings = useMemo(() => {
    if (activeTab === 'All' || activeTab === 'Nearby') return MOCK_LISTINGS;
    return MOCK_LISTINGS.filter((l) => l.type === activeTab);
  }, [activeTab]);

  const totalPages = Math.ceil(filteredListings.length / PAGE_SIZE);
  const pagedListings = filteredListings.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
  };

  return (
    <UserLayout showSearch showFab>
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">

        {/* ── "Rooms Near You" Banner ─────────────────────────────── */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between overflow-hidden relative"
          style={{ backgroundColor: '#1B8F8F' }}
        >
          {/* Left content */}
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-xs font-medium mb-0.5 flex items-center gap-1">
              <span>📍</span> Rooms Near You
            </p>
            <h2 className="text-white text-base font-bold mb-2">Based on your location</h2>
            {/* Green toggle pill */}
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
              <span className="text-white text-xs font-semibold">12 rooms available nearby</span>
            </div>
          </div>

          {/* Right map icon decoration */}
          <div className="flex-shrink-0 ml-4 opacity-30">
            <MapIcon size={56} color="white" />
          </div>

          {/* Decorative circles */}
          <div
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10"
            style={{ backgroundColor: 'white' }}
            aria-hidden="true"
          />
          <div
            className="absolute right-8 bottom-0 w-12 h-12 rounded-full opacity-10"
            style={{ backgroundColor: 'white' }}
            aria-hidden="true"
          />
        </div>

        {/* ── Category Tabs ───────────────────────────────────────── */}
        <SegmentedTabs
          tabs={CATEGORY_TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
          scrollable
        />

        {/* ── Filter Chips ─────────────────────────────────────────── */}
        <div className="-mx-4">
          <FilterPanel />
        </div>

        {/* ── Main content + sidebar layout ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* Left: listing grid */}
          <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800">
                PG / Shared Flat Listings
              </h2>
              <span className="text-xs text-gray-400">
                {filteredListings.length} results
              </span>
            </div>

            {/* Listing grid */}
            {pagedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {pagedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onViewDetail={setSelectedListing}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-1">No listings found</h3>
                <p className="text-sm text-gray-400">Try changing the category or clearing filters.</p>
              </div>
            )}

            {/* Pagination dots */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx)}
                    aria-label={`Page ${idx + 1}`}
                    aria-current={idx === page ? 'page' : undefined}
                    className={[
                      'rounded-full transition-all duration-200',
                      idx === page
                        ? 'w-6 h-2.5'
                        : 'w-2.5 h-2.5 opacity-40 hover:opacity-70',
                    ].join(' ')}
                    style={{ backgroundColor: '#1B8F8F' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar — visible on lg+ screens */}
          <div className="hidden lg:flex flex-col gap-4">
            <RoommateFinderPanel maxVisible={4} />
            <ReferralBanner />
          </div>
        </div>

        {/* Roommate panel + referral banner on mobile (below listing grid) */}
        <div className="flex flex-col gap-4 lg:hidden">
          <RoommateFinderPanel maxVisible={3} />
          <ReferralBanner />
        </div>
      </div>

      {/* ── Listing Detail Modal ──────────────────────────────────── */}
      <ListingDetailModal
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
      />

      {/* ── Add Listing Modal ─────────────────────────────────────── */}
      <AddListingModal
        isOpen={showAddListing}
        onClose={() => setShowAddListing(false)}
      />
    </UserLayout>
  );
}
