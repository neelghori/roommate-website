'use client';

/**
 * Explore page client component — src/app/(user)/explore/client.tsx
 * Browse by category, popular areas, and full listing grid.
 * Metadata is exported from page.tsx (server component).
 */

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { ListingCard } from '@/components/features/ListingCard';
import { ListingDetailModal } from '@/components/features/ListingDetailModal';
import { CategoryGrid } from '@/components/features/CategoryGrid';
import { MOCK_LISTINGS } from '@/mock/data';
import { POPULAR_AREAS } from '@/lib/staticData';
import { Listing } from '@/types';

export default function ExplorePageClient() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const filteredListings = MOCK_LISTINGS.filter((l) => {
    const matchesSearch =
      !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea =
      !selectedArea ||
      l.location.toLowerCase().includes(selectedArea.toLowerCase());
    return matchesSearch && matchesArea;
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // search is already reactive via state
  };

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
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 leading-tight">
            Find Your Perfect Space
          </h1>
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
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by area, type, or keyword…"
              className="flex-1 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
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
          <CategoryGrid />
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
