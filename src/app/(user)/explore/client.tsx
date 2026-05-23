'use client';

/**
 * Explore page client component src/app/(user)/explore/client.tsx
 * Browse by category, popular areas, and full listing grid.
 * Metadata is exported from page.tsx (server component).
 *
 * Query: `/explore?q=shiv+pg` initial search text from `q` (shareable / deep link).
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { UserLayout } from '@/components/shared/UserLayout';
import { ListingCard } from '@/components/features/ListingCard';
import { ListingDetailModal } from '@/components/features/ListingDetailModal';
import { CategoryGrid } from '@/components/features/CategoryGrid';
import { POPULAR_AREAS } from '@/lib/staticData';
import { listingMatchesArea } from '@/lib/listingLocationMatch';
import { buildExploreCategoriesFromListings } from '@/lib/exploreCategories';
import { useFilterStore } from '@/store/filterStore';
import { Listing } from '@/types';
import { formatListingTypeLabel } from '@/lib/utils/format';
import { listingService } from '@/services/modules/listing.service';
import { useToast } from '@/hooks/useToast';

function listingMatchesExploreSearch(listing: Listing, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = [
    listing.title,
    listing.location,
    listing.city,
    listing.formattedAddress,
    listing.addressLine2,
    listing.description,
    listing.type,
    formatListingTypeLabel(listing.type),
    listing.amenities.map((c) => c.name).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(s);
}

type ExplorePageClientProps = {
  initialListings?: Listing[];
};

export default function ExplorePageClient({ initialListings }: ExplorePageClientProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filtersType = useFilterStore((s) => s.filters.type);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>(initialListings ?? []);
  const toast = useToast();

  /** Keep search box in sync with `?q=` (e.g. `/explore?q=shiv%20pg`). Omitting `q` clears the field. */
  useEffect(() => {
    if (!searchParams.has('q')) {
      setSearchQuery('');
      return;
    }
    const raw = searchParams.get('q') ?? '';
    setSearchQuery(raw === '' ? '' : decodeURIComponent(raw.replace(/\+/g, ' ')));
  }, [searchParams]);

  useEffect(() => {
    let c = false;
    listingService
      .getListings()
      .then((rows) => {
        if (!c) setListings(rows);
      })
      .catch((e) => {
        if (!c) {
          toast.error('Could not load listings', e instanceof Error ? e.message : '');
          setListings([]);
        }
      });
    return () => {
      c = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exploreCategories = useMemo(() => buildExploreCategoriesFromListings(listings), [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchesType =
        !filtersType || filtersType === 'All' || l.type === filtersType;
      const matchesSearch = listingMatchesExploreSearch(l, searchQuery);
      const matchesArea = listingMatchesArea(l, selectedArea ?? undefined);
      return matchesType && matchesSearch && matchesArea;
    });
  }, [listings, searchQuery, selectedArea, filtersType]);

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const q = searchQuery.trim();
      const next = new URLSearchParams(searchParams.toString());
      if (q) next.set('q', q);
      else next.delete('q');
      const qs = next.toString();
      router.replace(qs ? `/explore?${qs}` : '/explore', { scroll: false });
    },
    [router, searchParams, searchQuery],
  );

  return (
    <UserLayout pageSuffix="Explore" showSearch={false} showFab>

      {/* ── Hero Search ─────────────────────────────────────────── */}
      <div
        className="relative px-4 py-12 lg:py-20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d7373 0%, #1B8F8F 50%, #22a8a8 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-12 -left-12 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: 'white' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -right-10 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: 'white' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-4 right-1/4 w-16 h-16 rounded-full opacity-5"
          style={{ backgroundColor: 'white' }}
          aria-hidden="true"
        />

        {/* Heading */}
        <div className="max-w-2xl mx-auto text-center mb-7 relative z-10">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
            🏠 Roommate &amp; PG Finder
          </p>
          <p className="text-3xl lg:text-5xl font-extrabold text-white mb-3 leading-tight" role="heading" aria-level={1}>
            Find Your Perfect Space
          </p>
          <p className="text-white/75 text-sm lg:text-base font-medium">
            500+ verified listings across Ahmedabad &amp; Gandhinagar
          </p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto relative z-10"
          role="search"
          aria-label="Search listings"
        >
          <div
            className="flex items-center gap-2 bg-white rounded-2xl p-1.5 pl-4"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <Search size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by area, type, or keyword…"
              className="roommat-inline-search flex-1 min-w-0 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent border-0 shadow-none ring-0 ring-offset-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
              aria-label="Search listings by area, type, or keyword"
            />
            <button
              type="submit"
              className="flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: '#F57C00' }}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ── Page content ────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-5 space-y-6">

        {/* Browse by Category */}
        <section aria-labelledby="category-heading">
          <p id="category-heading" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Browse by Category
          </p>
          <CategoryGrid categories={exploreCategories} />
        </section>

        {/* Popular Areas */}
        <section aria-labelledby="areas-heading">
          <p id="areas-heading" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Popular Areas in Ahmedabad
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" role="list" aria-label="Filter by area">
            {/* "All areas" chip */}
            <button
              onClick={() => setSelectedArea(null)}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-colors',
                !selectedArea
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400',
              ].join(' ')}
              style={!selectedArea ? { backgroundColor: '#1B8F8F' } : undefined}
              aria-pressed={!selectedArea}
            >
              All Areas
            </button>
            {POPULAR_AREAS.map((area) => {
              const isActive = selectedArea === area;
              return (
                <button
                  key={area}
                  onClick={() => setSelectedArea(isActive ? null : area)}
                  className={[
                    'flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap',
                    isActive
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400',
                  ].join(' ')}
                  style={isActive ? { backgroundColor: '#1B8F8F' } : undefined}
                  aria-pressed={isActive}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </section>

        {/* All Listings grid */}
        <section aria-labelledby="listings-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="listings-heading" className="text-sm font-bold text-gray-800">
              {selectedArea ? `Listings in ${selectedArea}` : 'All Listings'}
            </h2>
            <span className="text-xs text-gray-400">{filteredListings.length} found</span>
          </div>

          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredListings.map((listing) => (
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
                <Search size={28} style={{ color: '#1B8F8F' }} aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">No results found</h3>
              <p className="text-sm text-gray-400">
                Try a different keyword or clear the area filter.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Detail modal */}
      <ListingDetailModal
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </UserLayout>
  );
}
