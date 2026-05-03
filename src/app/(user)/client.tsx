'use client';

/**
 * Homepage Client component src/app/(user)/client.tsx
 * Main landing page with listings, filters, category tabs, sidebar panels.
 * Metadata is exported from page.tsx (server component).
 */

import React, { useState, useMemo, useEffect } from 'react';
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
import { Listing, type ListingFilter, type ListingType } from '@/types';
import { listingService } from '@/services/modules/listing.service';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/store/authStore';
import { geocodePlaceName } from '@/lib/geocodeLocation';
import { hasMapCoordinates } from '@/lib/googleMapsEmbed';

/** Server geo radius (meters via `$geoWithin` / `$centerSphere`) when browsing by profile location (geocoded city/area). */
const PROFILE_NEAR_RADIUS_KM = 45;
/** Tighter radius when the Nearby tab uses GPS or profile fallback. */
const NEARBY_RADIUS_KM = 25;

const CATEGORY_TABS = [
  { label: 'All', value: 'All' },
  { label: 'Flat', value: 'Flat' },
  { label: 'PG', value: 'PG' },
  { label: 'Roommate', value: 'Roommate' },
  { label: 'Nearby', value: 'Nearby' },
];

export default function HomePageClient() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [showAddListing, setShowAddListing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nearCoords, setNearCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [profileGeoCoords, setProfileGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const observerRef = React.useRef<HTMLDivElement>(null);
  const toast = useToast();
  const user = useAuthStore((s) => s.user);

  const { filters } = useFilterStore();
  const { visibleCount, loadMore, resetPagination, listings, setListings } = useListingStore();

  useEffect(() => {
    const loc = user?.location?.trim();
    if (!loc) {
      setProfileGeoCoords(null);
      return;
    }
    let cancelled = false;
    void geocodePlaceName(loc).then((coords) => {
      if (cancelled) return;
      if (coords && hasMapCoordinates(coords.lat, coords.lng)) setProfileGeoCoords(coords);
      else setProfileGeoCoords(null);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.location]);

  const apiFilter = useMemo((): ListingFilter => {
    const f: ListingFilter = { ...filters };
    if (activeTab !== 'All' && activeTab !== 'Nearby') {
      f.type = activeTab as ListingType;
    } else {
      f.type = 'All';
    }

    const geoCenter = activeTab === 'Nearby' ? nearCoords ?? profileGeoCoords : profileGeoCoords;
    if (geoCenter) {
      f.nearLatitude = geoCenter.lat;
      f.nearLongitude = geoCenter.lng;
      f.radiusKm = activeTab === 'Nearby' ? NEARBY_RADIUS_KM : PROFILE_NEAR_RADIUS_KM;
    }

    return f;
  }, [filters, activeTab, nearCoords, profileGeoCoords]);

  useEffect(() => {
    let cancelled = false;
    listingService
      .getListings(apiFilter)
      .then((rows) => {
        if (!cancelled) setListings(rows);
      })
      .catch((e) => {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Unknown error';
          toast.error('Could not load listings', msg);
          setListings([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [apiFilter, setListings, toast]);

  useEffect(() => {
    resetPagination();
  }, [apiFilter, resetPagination]);

  useEffect(() => {
    if (activeTab !== 'Nearby') {
      setNearCoords(null);
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setNearCoords(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setNearCoords(hasMapCoordinates(lat, lng) ? { lat, lng } : null);
      },
      () => setNearCoords(null),
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 12_000 },
    );
  }, [activeTab]);

  /** Nearby: server geo filter when GPS or geocoded profile location exists; else listings that have map pins only. */
  const filteredListings = useMemo(() => {
    if (activeTab !== 'Nearby') {
      return listings;
    }
    if (nearCoords ?? profileGeoCoords) {
      return listings;
    }
    return listings.filter(
      (l) => typeof l.latitude === 'number' && typeof l.longitude === 'number',
    );
  }, [listings, activeTab, nearCoords, profileGeoCoords]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetPagination();
  };

  const hasMoreFiltered = visibleCount < filteredListings.length;

  const handleIntersect = React.useCallback(() => {
    if (hasMoreFiltered) {
      setIsLoadingMore(true);
      setTimeout(() => {
        loadMore();
        setIsLoadingMore(false);
      }, 600);
    }
  }, [hasMoreFiltered, loadMore]);

  React.useEffect(() => {
    const scrollToBrowse = () => {
      if (typeof window === 'undefined' || window.location.hash !== '#browse') return;
      const el = document.getElementById('browse');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    scrollToBrowse();
    window.addEventListener('hashchange', scrollToBrowse);
    return () => window.removeEventListener('hashchange', scrollToBrowse);
  }, []);

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
      <div
        id="browse"
        className="scroll-mt-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-4 space-y-4"
      >

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
              <span className="text-white text-xs font-semibold">
                {listings.length} published listing{listings.length !== 1 ? 's' : ''} on Roommat
              </span>
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

        {activeTab === 'Nearby' && !nearCoords && !profileGeoCoords && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            Allow location access or set your city in profile to see listings by distance (within ~
            {NEARBY_RADIUS_KM} km). Until then, only listings with a map pin are shown.
          </p>
        )}
        {activeTab === 'Nearby' && !nearCoords && profileGeoCoords && (
          <p className="text-xs text-teal-900 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
            Using your profile location for distance (~{NEARBY_RADIUS_KM} km). Enable precise
            location for best accuracy.
          </p>
        )}

        {/* ── Filter Chips ─────────────────────────────────────────── */}
        <div className="-mx-4 lg:mx-0">
          <FilterPanel />
        </div>

        {/* ── Main content + sidebar (single roommate panel was duplicated for lg/mobile) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* Left: listing grid */}
          <div className="min-w-0">
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

          {/* Right column: same stack on all breakpoints (below listings on mobile, sidebar on lg+) */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <RoommateFinderPanel maxVisible={4} />
            <ReferralBanner />
          </aside>
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
