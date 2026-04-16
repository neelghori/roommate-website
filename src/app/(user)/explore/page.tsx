'use client';

/**
 * Explore page — src/app/(user)/explore/page.tsx
 * Browse by category, popular areas, and full listing grid.
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

export default function ExplorePage() {
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
        className="px-4 py-8"
        style={{ backgroundColor: '#1B8F8F' }}
      >
        <div className="max-w-lg mx-auto text-center mb-5">
          <h1 className="text-xl font-bold text-white mb-1">
            🔍 Find Your Perfect Space
          </h1>
          <p className="text-white/70 text-sm">
            Search from 500+ verified listings across Ahmedabad &amp; Gandhinagar
          </p>
        </div>

        {/* Search input + button */}
        <form
          onSubmit={handleSearch}
          className="max-w-lg mx-auto flex gap-2"
        >
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by area, type, or keyword..."
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              aria-label="Search listings"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl text-sm font-bold text-white flex-shrink-0 hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ backgroundColor: '#F57C00' }}
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Page content ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-6">

        {/* Browse by Category */}
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Browse by Category
          </p>
          <CategoryGrid />
        </section>

        {/* Popular Areas */}
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Popular Areas in Ahmedabad
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
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
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">
              {selectedArea ? `Listings in ${selectedArea}` : 'All Listings'}
            </p>
            <span className="text-xs text-gray-400">{filteredListings.length} found</span>
          </div>

          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Search size={28} style={{ color: '#1B8F8F' }} />
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
