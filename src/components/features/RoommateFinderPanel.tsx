/**
 * RoommateFinderPanel.tsx
 * "Find Roommate" sidebar panel shown on the homepage right side.
 *
 * From mockup:
 * - "Find Roommate" heading
 * - [Student] [Working] [Veg Only] tab filter
 * - Profile card list
 * - "View more roommates →" link
 */
'use client';

import React, { useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { RoommateProfile } from '@/types';
import { ProfileCard } from '@/components/features/ProfileCard';
import { ROOMMATE_PROFILES } from '@/mock/data';

type RoleTab = 'All' | 'Student' | 'Working' | 'Veg Only';

const TABS: RoleTab[] = ['All', 'Student', 'Working', 'Veg Only'];

interface RoommateFinderPanelProps {
  /** Override mock profiles with real data */
  profiles?: RoommateProfile[];
  /** How many profiles to show before "view more" */
  maxVisible?: number;
  onViewMore?: () => void;
  onChatClick?: (profile: RoommateProfile) => void;
}

export const RoommateFinderPanel: React.FC<RoommateFinderPanelProps> = ({
  profiles = ROOMMATE_PROFILES,
  maxVisible = 4,
  onViewMore,
  onChatClick,
}) => {
  const [activeTab, setActiveTab] = useState<RoleTab>('All');

  const filtered = useMemo(() => {
    if (activeTab === 'All') return profiles;
    return profiles.filter((p) => p.role === activeTab);
  }, [profiles, activeTab]);

  const visible = filtered.slice(0, maxVisible);
  const hasMore = filtered.length > maxVisible;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Find Roommate</h2>
        {hasMore && (
          <button
            onClick={onViewMore}
            className="text-xs font-medium hover:underline flex items-center gap-0.5"
            style={{ color: '#1B8F8F' }}
          >
            View all
          </button>
        )}
      </div>

      {/* Tab filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              activeTab === tab
                ? 'text-white border-transparent'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-400',
            ].join(' ')}
            style={
              activeTab === tab
                ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F' }
                : undefined
            }
            aria-pressed={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile cards */}
      <div className="space-y-2.5">
        {visible.length > 0 ? (
          visible.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} onChatClick={onChatClick} />
          ))
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-400">No profiles in this category.</p>
          </div>
        )}
      </div>

      {/* View more link */}
      {hasMore && (
        <button
          onClick={onViewMore}
          className="w-full flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-xl hover:bg-gray-50 transition-colors"
          style={{ color: '#1B8F8F' }}
        >
          View more roommates
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
};
