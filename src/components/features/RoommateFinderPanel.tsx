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
    <div className="bg-primary/5 rounded-[2rem] p-5 space-y-4 border border-primary/10">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Find Roommate</h2>
        {hasMore && (
          <button
            onClick={onViewMore}
            className="text-xs font-medium hover:underline flex items-center gap-0.5 text-primary"
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
                 ? 'bg-primary text-white border-transparent shadow-md shadow-primary/20'
                 : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary',
             ].join(' ')}
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
          className="w-full flex items-center justify-center gap-1.5 text-sm font-bold py-3 rounded-2xl bg-white hover:bg-gray-50 transition-all text-primary border border-primary/10 shadow-sm active:scale-[0.98]"
        >
          View more roommates
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
};
