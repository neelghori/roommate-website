'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, IndianRupee, MessageCircle, UserPlus, RefreshCw } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { MATCHES } from '@/mock/data/users';
import { Match } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function MatchesPage() {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = (match: Match) => {
    if (connected.has(match.id)) return;
    setConnected((prev) => new Set([...prev, match.id]));
    toast.success('Request Sent!', `Connect request sent to ${match.name}.`);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.info('Matches refreshed');
    }, 1200);
  };

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
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Refresh matches"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Based on your lifestyle, budget, and preferences
        </p>

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

      {/* Match cards */}
      <div className="pb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {MATCHES.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            isConnected={connected.has(match.id)}
            onConnect={() => handleConnect(match)}
          />
        ))}
      </div>

      {/* How matching works */}
      <div className="mb-4 rounded-2xl p-4 border border-teal-100" style={{ backgroundColor: '#EDF5F5' }}>
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" style={{ color: '#1B8F8F' }} />
          How we match
        </h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Lifestyle compatibility (smoking, diet, schedule)</li>
          <li>• Budget overlap and location preferences</li>
          <li>• Move-in timing alignment</li>
          <li>• Gender preference settings</li>
        </ul>
        <Link
          href="/profile/edit"
          className="mt-3 inline-block text-xs font-semibold underline"
          style={{ color: '#1B8F8F' }}
        >
          Update my preferences →
        </Link>
      </div>
      </div>{/* max-w-7xl */}
    </UserLayout>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
interface MatchCardProps {
  match: Match;
  isConnected: boolean;
  onConnect: () => void;
}

function MatchCard({ match, isConnected, onConnect }: MatchCardProps) {
  const matchColor =
    match.matchPercent >= 85
      ? '#22C55E'
      : match.matchPercent >= 70
        ? '#1B8F8F'
        : '#F57C00';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Match % bar */}
      <div className="h-1.5 w-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${match.matchPercent}%`, backgroundColor: matchColor }}
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
              {match.avatarInitial}
            </div>
            {match.isOnline && (
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900 truncate">{match.name}</h3>
              <span
                className="flex-shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: matchColor }}
              >
                {match.matchPercent}%
              </span>
            </div>

            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">{match.location}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <IndianRupee className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500">
                {match.budget.toLocaleString('en-IN')}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {match.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Link
            href={`/roommates/${MATCHES.indexOf(match) + 1}`}
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
