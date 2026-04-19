'use client';

/**
 * Homepage Client component — src/app/(user)/client.tsx
 * Main landing page with listings, filters, category tabs, sidebar panels.
 * Metadata is exported from page.tsx (server component).
 */

import React, { useState, useMemo } from 'react';
import { MapIcon } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { useListingStore } from '@/store/listingStore';
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

export default function HomePageClient() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [showAddListing, setShowAddListing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = React.useRef<HTMLDivElement>(null);

  const { filters } = useFilterStore();
  const { visibleCount, loadMore, resetPagination, hasMore } = useListingStore();

  const filteredListings = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => {
      // 1. Tab / Category Filter
      if (activeTab !== 'All' && activeTab !== 'Nearby') {
        if (l.type !== activeTab) return false;
      }

      // 2. Price / Budget Filter
      if (filters.minPrice !== undefined && l.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && l.price > filters.maxPrice) return false;

      // 3. Verified Filter
      if (filters.isVerified && !l.isVerified) return false;

      // 4. Gender Filter
      if (filters.genderPreference && filters.genderPreference !== 'Any') {
        if (l.genderPreference !== filters.genderPreference) return false;
      }

      // 5. Amenities Filter
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = (filters.amenities as string[]).every((a) =>
          l.amenities.includes(a as any)
        );
        if (!hasAllAmenities) return false;
      }

      // 6. City Filter (if applicable)
      if (filters.city && l.city !== filters.city) return false;

      return true;
    });
  }, [activeTab, filters]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetPagination();
  };

  const handleIntersect = React.useCallback(() => {
    if (hasMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        loadMore();
        setIsLoadingMore(false);
      }, 600);
    }
  }, [hasMore, loadMore]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleIntersect();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersect]);

  const pagedListings = filteredListings.slice(0, visibleCount);

  return (
    <UserLayout showSearch showFab>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-4 space-y-4">

        {/* ── "Rooms Near You" Banner ─────────────────────────────── */}
        <div
          className="rounded-2xl p-5 lg:p-6 flex items-center justify-between overflow-hidden relative"
          style={{ backgroundColor: '#1B8F8F' }}
        >
          {/* Left content */}
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-xs font-medium mb-0.5 flex items-center gap-1">
              <span>📍</span> Rooms Near You
            </p>
            <h2 className="text-white text-base lg:text-xl font-bold mb-2">Based on your location</h2>
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
        <div className="-mx-4 lg:mx-0">
          <FilterPanel />
        </div>

        {/* ── Main content + sidebar layout ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-6 items-start">

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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="h-10 w-full" />

            {isLoadingMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[380px] rounded-2xl bg-gray-100 animate-pulse" />
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
