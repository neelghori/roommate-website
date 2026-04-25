'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  IndianRupee,
  Calendar,
  MessageCircle,
  UserPlus,
  Heart,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { useToast } from '@/hooks/useToast';
import type { RoommateProfile } from '@/types';
import { tenantRoommateProfileService } from '@/services/modules/tenantRoommateProfile.service';

const LIFESTYLE_EMOJI: Record<string, string> = {
  'Non-Smoker': '🚭',
  Vegetarian: '🥗',
  'Non-Veg': '🍗',
  'Early Bird': '🌅',
  'Night Owl': '🦉',
  'Pet Friendly': '🐾',
  Working: '💼',
  Student: '📚',
};

export default function RoommateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success: toastSuccess, info: toastInfo } = useToast();

  const [profile, setProfile] = useState<RoommateProfile | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [isSaved, setIsSaved] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadState('loading');
    tenantRoommateProfileService
      .getById(String(id))
      .then((p) => {
        if (!cancelled) {
          setProfile(p);
          setRequested(Boolean(p.isConnected));
          setLoadState('ok');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null);
          setLoadState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const matchColor =
    profile && profile.matchPercent >= 85
      ? '#22C55E'
      : profile && profile.matchPercent >= 70
        ? '#1B8F8F'
        : '#F57C00';

  const handleConnect = () => {
    if (requested) return;
    setRequested(true);
    toastSuccess('Request Sent!', `A roommate request was sent to ${profile?.name ?? 'them'}.`);
  };

  const handleSave = () => {
    setIsSaved((v) => !v);
    toastInfo(isSaved ? 'Removed from saved' : 'Profile saved');
  };

  if (loadState === 'loading') {
    return (
      <UserLayout showSearch={false} showFab={false}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-gray-500">Loading profile…</div>
      </UserLayout>
    );
  }

  if (loadState === 'error' || !profile) {
    return (
      <UserLayout showSearch={false} showFab={false}>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile not found</h3>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: '#1B8F8F' }}
          >
            Go Back
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout showSearch={false} showFab={false}>
      <div className="max-w-4xl mx-auto">
        <div className="px-4 lg:px-8 pt-4 pb-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="mx-4 lg:mx-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="h-24 w-full"
            style={{
              background: 'linear-gradient(135deg, #1B8F8F 0%, #0e6060 100%)',
            }}
          />

          <div className="px-4 pb-4">
            <div className="-mt-10 mb-3 flex items-end justify-between">
              <div
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-2xl shadow"
                style={{ backgroundColor: '#1B8F8F' }}
              >
                {profile.avatarInitial}
              </div>
              <span
                className="text-sm font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: matchColor }}
              >
                {profile.matchPercent}% match
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{profile.occupation}</p>
            {profile.age != null && <p className="text-xs text-gray-400 mt-0.5">{profile.age} years old</p>}

            <div className="flex gap-4 mt-3 flex-wrap">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{profile.location}</span>
                </div>
              )}
              {profile.budget != null && (
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{profile.budget.toLocaleString('en-IN')}/mo</span>
                </div>
              )}
              {profile.moveInDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    From{' '}
                    {new Date(profile.moveInDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="mx-4 lg:mx-8 mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        <div className="mx-4 lg:mx-8 mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Lifestyle</h2>
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100"
              >
                <span className="text-sm">{LIFESTYLE_EMOJI[tag] ?? '✓'}</span>
                <span className="text-xs font-medium text-teal-700">{tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 lg:mx-8 mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Verified Details</h2>
          <div className="space-y-2">
            {[
              { label: 'Phone Verified', ok: false },
              { label: 'Occupation', ok: true },
              { label: 'Aadhaar', ok: false },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center gap-2">
                {ok ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <span className={`text-sm ${ok ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 lg:mx-8 mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700">Reviews</h2>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">4.8</span>
              <span className="text-xs text-gray-400">(12)</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 italic">
            Reviews are available after connecting — backend integration required.
          </p>
        </div>

        <div className="px-4 lg:px-8 pt-4 pb-6 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-colors ${
              isSaved ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600 bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>

          {profile.isConnected || requested ? (
            <Link
              href="/chat"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: requested ? '#6B7280' : '#1B8F8F' }}
              disabled={requested}
            >
              <UserPlus className="w-4 h-4" />
              {requested ? 'Request Sent' : 'Send Connect Request'}
            </button>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
