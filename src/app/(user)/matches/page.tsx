'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, IndianRupee, MessageCircle, UserPlus, RefreshCw, Check } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { RoommateProfile } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import {
  tenantRoommateProfileService,
  type TenantRoommateProfileMine,
} from '@/services/modules/tenantRoommateProfile.service';
import { computeVibeCheck, type VibeCheckResult } from '@/lib/matching/vibeCheck';
import { userService } from '@/services/modules/user.service';

type ScoredMatch = {
  profile: RoommateProfile;
  vibe: VibeCheckResult;
};

export default function MatchesPage() {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<ScoredMatch[]>([]);
  const [listState, setListState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [hasProfile, setHasProfile] = useState(true);
  const { toast } = useToast();

  const user = useAuthStore((s) => s.user);

  const load = useCallback(async () => {
    setListState('loading');
    try {
      // Fetch the viewer's own seeker profile and the candidate pool together.
      const [mine, candidates] = await Promise.all([
        tenantRoommateProfileService.getMine().catch(() => null as TenantRoommateProfileMine | null),
        tenantRoommateProfileService.list(),
      ]);

      setHasProfile(mine != null);

      const scored = candidates
        .filter((p) => (user?.id ? String(p.userId) !== String(user.id) : true))
        .map((profile) => ({ profile, vibe: computeVibeCheck(mine, profile) }))
        .sort((a, b) => b.vibe.score - a.vibe.score);

      setMatches(scored);
      setConnected(new Set(scored.filter((m) => m.profile.isConnected).map((m) => m.profile.id)));
      setListState('ok');
    } catch {
      setMatches([]);
      setListState('error');
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConnect = async (match: ScoredMatch) => {
    const id = match.profile.id;
    if (connected.has(id)) return;
    // Optimistically mark connected, roll back if the request fails.
    setConnected((prev) => new Set([...prev, id]));
    try {
      await userService.sendRequest(id);
      toast.success('Request Sent!', `Connect request sent to ${match.profile.name}.`);
    } catch (err) {
      setConnected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error('Could not send request', err instanceof Error ? err.message : undefined);
    }
  };

  const greatCount = useMemo(
    () => matches.filter((m) => m.vibe.score >= 85).length,
    [matches],
  );

  return (
    <UserLayout showSearch={false} showFab={false} pageSuffix="Matches">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="pt-4 pb-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: '#F57C00' }} />
              <h1 className="text-xl font-bold text-gray-900">Your Matches</h1>
            </div>
            <button
              onClick={() => void load()}
              disabled={listState === 'loading'}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="Refresh matches"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${listState === 'loading' ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {listState === 'ok' && matches.length > 0
              ? `${greatCount} great match${greatCount !== 1 ? 'es' : ''} from your Vibe-Check`
              : 'Based on your lifestyle, budget, and preferences'}
          </p>

          {/* Prompt to complete profile for accurate scoring */}
          {listState === 'ok' && !hasProfile && (
            <div className="mb-4 rounded-2xl p-4 border border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-800">
                Complete your roommate profile so the Vibe-Check can score matches on your
                actual lifestyle, diet, and budget.{' '}
                <Link href="/roommates/profile" className="font-semibold underline">
                  Set up your profile →
                </Link>
              </p>
            </div>
          )}

          {/* Match quality legend */}
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              Great match (85%+)
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#1B8F8F' }} />
              Good (70%+)
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#F57C00' }} />
              Fair
            </div>
          </div>
        </div>

        {/* States */}
        {listState === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-sm text-gray-500">
            Finding your best matches…
          </div>
        ) : listState === 'error' ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Could not load matches</h3>
            <p className="text-sm text-gray-500 mb-4">Check your connection and that the API is running.</p>
            <button
              type="button"
              onClick={() => void load()}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              Retry
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No matches yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              As more roommate seekers join your area, your Vibe-Check matches will appear here.
            </p>
            <Link
              href="/roommates"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              Browse roommates
            </Link>
          </div>
        ) : (
          <>
            {/* Match cards */}
            <div className="pb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {matches.map((match) => (
                <MatchCard
                  key={match.profile.id}
                  match={match}
                  isConnected={connected.has(match.profile.id)}
                  onConnect={() => void handleConnect(match)}
                />
              ))}
            </div>

            {/* How matching works */}
            <div className="mb-4 rounded-2xl p-4 border border-teal-100" style={{ backgroundColor: '#EDF5F5' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" style={{ color: '#1B8F8F' }} />
                How the Vibe-Check works
              </h3>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Lifestyle compatibility — diet, smoking, day schedule</li>
                <li>• Budget overlap and move-in timing alignment</li>
                <li>• Shared interests and habits from your profiles</li>
              </ul>
              <Link
                href="/roommates/profile"
                className="mt-3 inline-block text-xs font-semibold underline"
                style={{ color: '#1B8F8F' }}
              >
                Update my preferences →
              </Link>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
interface MatchCardProps {
  match: ScoredMatch;
  isConnected: boolean;
  onConnect: () => void;
}

function MatchCard({ match, isConnected, onConnect }: MatchCardProps) {
  const { profile, vibe } = match;
  const matchColor =
    vibe.score >= 85 ? '#22C55E' : vibe.score >= 70 ? '#1B8F8F' : '#F57C00';
  const budget = profile.monthlyBudget ?? profile.budget;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Match % bar */}
      <div className="h-1.5 w-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${vibe.score}%`, backgroundColor: matchColor }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              {profile.avatarInitial}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900 truncate">{profile.name}</h3>
              <span
                className="flex-shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: matchColor }}
              >
                {vibe.score}%
              </span>
            </div>

            {profile.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 truncate">{profile.location}</span>
              </div>
            )}
            {budget != null && (
              <div className="flex items-center gap-1 mt-0.5">
                <IndianRupee className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500">{budget.toLocaleString('en-IN')}/mo</span>
              </div>
            )}
          </div>
        </div>

        {/* Why you match */}
        {vibe.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {vibe.reasons.slice(0, 3).map((reason) => (
              <span
                key={reason}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"
              >
                <Check className="w-3 h-3" />
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Lifestyle tags */}
        {(profile.lifestyleTags ?? profile.tags).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(profile.lifestyleTags ?? profile.tags).slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Link
            href={`/roommates/${profile.id}`}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 text-center hover:bg-gray-50 transition-colors"
          >
            View Profile
          </Link>
          {isConnected ? (
            <Link
              href="/chat"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white text-center flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Link>
          ) : (
            <button
              onClick={onConnect}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              <UserPlus className="w-4 h-4" />
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
