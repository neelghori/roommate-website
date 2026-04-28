/**
 * RoommateFinderPanel.tsx
 * "Find Roommate" sidebar panel shown on the homepage right side.
 *
 * Loads profiles from GET /api/v1/tenant-roommate-profiles — full list, not narrowed by viewer profile.
 * Role tabs filter by display role (Student / Working / Veg Only).
 */
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { RoommateProfile } from '@/types';
import { ProfileCard } from '@/components/features/ProfileCard';
import { tenantRoommateProfileService } from '@/services/modules/tenantRoommateProfile.service';
import { useAuthStore } from '@/store/authStore';

type RoleTab = 'All' | 'Student' | 'Working' | 'Veg Only';

const TABS: RoleTab[] = ['All', 'Student', 'Working', 'Veg Only'];

interface RoommateFinderPanelProps {
  /** When set, skips API fetch and shows these profiles (e.g. tests). */
  profiles?: RoommateProfile[];
  maxVisible?: number;
  onViewMore?: () => void;
  onChatClick?: (profile: RoommateProfile) => void;
}

export const RoommateFinderPanel: React.FC<RoommateFinderPanelProps> = ({
  profiles: profilesProp,
  maxVisible = 4,
  onViewMore,
  onChatClick,
}) => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const viewerUserId = useAuthStore((s) => s.user?.id);
  const controlled = profilesProp !== undefined;
  const [fetched, setFetched] = useState<RoommateProfile[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>(() =>
    controlled ? 'idle' : 'loading',
  );
  const [activeTab, setActiveTab] = useState<RoleTab>('All');

  const load = useCallback(async () => {
    if (controlled) return;
    setLoadState('loading');
    try {
      const items = await tenantRoommateProfileService.list();
      setFetched(items);
      setLoadState('idle');
    } catch {
      setFetched([]);
      setLoadState('error');
    }
  }, [controlled]);

  useEffect(() => {
    void load();
  }, [load]);

  const profiles = controlled ? profilesProp! : fetched;

  const withoutSelf = useMemo(() => {
    if (!viewerUserId) return profiles;
    return profiles.filter((p) => String(p.userId) !== String(viewerUserId));
  }, [profiles, viewerUserId]);

  const filtered = useMemo(() => {
    if (activeTab === 'All') return withoutSelf;
    return withoutSelf.filter((p) => p.role === activeTab);
  }, [withoutSelf, activeTab]);

  const visible = filtered.slice(0, maxVisible);
  const hasMore = filtered.length > maxVisible;

  const goRoommates = () => {
    if (onViewMore) onViewMore();
    else router.push('/roommates');
  };

  const handleChat = (profile: RoommateProfile) => {
    if (onChatClick) {
      onChatClick(profile);
      return;
    }
    if (!profile.userId) {
      router.push('/chat');
      return;
    }
    const path = `/chat/${profile.userId}`;
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  return (
    <div className="space-y-1">
      {!controlled && loadState !== 'loading' && loadState !== 'error' && (
        <div className="px-1 space-y-0.5">
          <p className="text-xs text-gray-500">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
      <div className="bg-primary/5 rounded-4xl p-5 space-y-4 border border-primary/10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Find Roommate</h2>
          {filtered.length > 0 && (
            <button
              type="button"
              onClick={goRoommates}
              className="text-xs font-medium hover:underline flex items-center gap-0.5 text-primary"
            >
              View all
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
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

        {!controlled && loadState === 'loading' && (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-3 h-[140px] animate-pulse"
                aria-hidden
              />
            ))}
          </div>
        )}

        {!controlled && loadState === 'error' && (
          <div className="py-6 text-center space-y-2">
            <p className="text-sm text-gray-500">Could not load roommates.</p>
            <button
              type="button"
              onClick={() => void load()}
              className="text-xs font-semibold text-primary underline"
            >
              Try again
            </button>
          </div>
        )}

        {(controlled || loadState === 'idle') && (
          <div className="space-y-2.5">
            {visible.length > 0 ? (
              visible.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} onChatClick={handleChat} />
              ))
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm text-gray-400">No roommate profiles in this category yet.</p>
                <Link href="/roommates" className="inline-block text-xs font-semibold text-primary hover:underline">
                  Browse all roommates
                </Link>
              </div>
            )}
          </div>
        )}

        {hasMore && (controlled || loadState === 'idle') && (
          <button
            type="button"
            onClick={goRoommates}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-bold py-3 rounded-2xl bg-white hover:bg-gray-50 transition-all text-primary border border-primary/10 shadow-sm active:scale-[0.98]"
          >
            View more roommates
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
