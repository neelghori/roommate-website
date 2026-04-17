'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, MapPin, IndianRupee, Heart, MessageCircle } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { ROOMMATE_PROFILES } from '@/mock/data/users';
import { RoommateProfile } from '@/types';

const LIFESTYLE_FILTER_OPTIONS = [
  'Non-Smoker', 'Vegetarian', 'Non-Veg', 'Early Bird', 'Night Owl',
  'Pet Friendly', 'Working', 'Student',
];

export default function RoommatesPage() {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return ROOMMATE_PROFILES.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.location ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (p.occupation ?? '').toLowerCase().includes(search.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => p.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [search, selectedTags]);

  return (
    <UserLayout showSearch={false} showFab={false} pageSuffix="Roommates">
      <div className="px-4 pt-4 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Find Roommates</h1>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              showFilters || selectedTags.length > 0
                ? 'border-teal-600 text-teal-600 bg-teal-50'
                : 'border-gray-200 text-gray-600 bg-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {selectedTags.length > 0 && (
              <span
                className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                style={{ backgroundColor: '#1B8F8F' }}
              >
                {selectedTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name, location, or occupation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Tag filters */}
        {showFilters && (
          <div className="bg-white rounded-xl p-3 mb-3 border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Lifestyle
            </p>
            <div className="flex flex-wrap gap-2">
              {LIFESTYLE_FILTER_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'border-teal-600 text-teal-700 bg-teal-50'
                      : 'border-gray-200 text-gray-600 bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="mt-2 text-xs text-red-500 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Result count */}
        <p className="text-xs text-gray-500 mb-3">
          {filtered.length} roommate{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No roommates found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-3">
          {filtered.map((profile) => (
            <RoommateCard
              key={profile.id}
              profile={profile}
              isSaved={savedIds.has(profile.id)}
              onSave={() => toggleSave(profile.id)}
            />
          ))}
        </div>
      )}
    </UserLayout>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface RoommateCardProps {
  profile: RoommateProfile;
  isSaved: boolean;
  onSave: () => void;
}

function RoommateCard({ profile, isSaved, onSave }: RoommateCardProps) {
  const matchColor =
    profile.matchPercent >= 85
      ? '#22C55E'
      : profile.matchPercent >= 70
        ? '#1B8F8F'
        : '#F57C00';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top row: avatar + name + match */}
      <div className="flex items-start gap-3 p-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: '#1B8F8F' }}
        >
          {profile.avatarInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 truncate">{profile.name}</h3>
            <span
              className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: matchColor }}
            >
              {profile.matchPercent}% match
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{profile.occupation}</p>
          {profile.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 truncate">{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Budget + move-in */}
      {(profile.budget || profile.moveInDate) && (
        <div className="flex gap-4 px-4 pb-3">
          {profile.budget && (
            <div className="flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {profile.budget.toLocaleString('en-IN')}/mo
              </span>
            </div>
          )}
          {profile.moveInDate && (
            <span className="text-xs text-gray-500">
              Move-in: {new Date(profile.moveInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-xs text-gray-500 px-4 pb-3 line-clamp-2">{profile.bio}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {profile.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={onSave}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
            isSaved ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <div className="w-px bg-gray-100" />
        {profile.isConnected ? (
          <Link
            href={`/chat`}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Link>
        ) : (
          <Link
            href={`/roommates/${profile.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors"
          >
            View Profile
          </Link>
        )}
      </div>
    </div>
  );
}
