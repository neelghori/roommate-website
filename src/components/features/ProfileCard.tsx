/**
 * ProfileCard.tsx
 * Compact card showing a roommate's profile.
 * Shown in the "Find Roommate" right sidebar.
 */
'use client';

import React, { useState } from 'react';
import { Star, MessageCircle, Eye } from 'lucide-react';
import { RoommateProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { tenantRoommateProfileService } from '@/services/modules/tenantRoommateProfile.service';
import { RoommateProfileDetailModal } from '@/components/features/RoommateProfileDetailModal';
import { UserAvatarImage } from '@/components/ui/UserAvatarImage';

const TAG_STYLES: Record<string, string> = {
  WORKING: 'bg-amber-100 text-amber-800',
  Working: 'bg-amber-100 text-amber-800',
  STUDENT: 'bg-blue-100 text-blue-700',
  Student: 'bg-blue-100 text-blue-700',
  VEGETARIAN: 'bg-green-100 text-green-700',
  Vegetarian: 'bg-green-100 text-green-700',
  'Veg Only': 'bg-green-100 text-green-700',
  'Non-Smoker': 'bg-gray-100 text-gray-600',
  'Non-smoker': 'bg-gray-100 text-gray-600',
  NON_SMOKER: 'bg-gray-100 text-gray-600',
  Smoker: 'bg-red-100 text-red-600',
  SMOKER: 'bg-red-100 text-red-600',
  'Non-Veg': 'bg-orange-100 text-orange-700',
  'Non-veg': 'bg-orange-100 text-orange-700',
  NON_VEG: 'bg-orange-100 text-orange-700',
  'Early Bird': 'bg-yellow-100 text-yellow-700',
  EARLY_BIRD: 'bg-yellow-100 text-yellow-700',
  'Night Owl': 'bg-indigo-100 text-indigo-700',
  NIGHT_OWL: 'bg-indigo-100 text-indigo-700',
  'Pet Friendly': 'bg-purple-100 text-purple-700',
  PET_FRIENDLY: 'bg-purple-100 text-purple-700',
};

const DEFAULT_TAG_STYLE = 'bg-gray-100 text-gray-600';

interface ProfileCardProps {
  profile: RoommateProfile;
  onChatClick?: (profile: RoommateProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onChatClick }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProfile, setDetailProfile] = useState<RoommateProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const toast = useToast();

  const handleChat = () => {
    onChatClick?.(profile);
    toast.info('Opening chat...', `Starting conversation with ${profile.name}`);
  };

  const openDetails = () => {
    setDetailProfile(profile);
    setDetailOpen(true);
    setDetailLoading(true);
    void tenantRoommateProfileService
      .getById(profile.id)
      .then((full) => setDetailProfile(full))
      .catch(() => {
        /* keep list snapshot */
      })
      .finally(() => setDetailLoading(false));
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-primary overflow-hidden"
            aria-label={`${profile.name}'s avatar`}
          >
            {profile.avatarUrl ? (
              <UserAvatarImage src={profile.avatarUrl} className="h-full w-full object-cover" />
            ) : (
              profile.avatarInitial
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{profile.name}</p>
            {profile.occupation && (
              <p className="text-xs text-gray-500 truncate">{profile.occupation}</p>
            )}
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star size={11} className="text-secondary fill-secondary" />
            <span className="text-xs font-semibold text-gray-700">{profile.matchPercent}%</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {profile.tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className={[
                'text-[10px] font-semibold rounded-full px-2 py-0.5',
                TAG_STYLES[tag] ?? DEFAULT_TAG_STYLE,
              ].join(' ')}
            >
              {tag}
            </span>
          ))}
        </div>

        {(profile.budget || profile.location) && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {profile.budget && (
              <span>
                ₹{profile.budget.toLocaleString('en-IN')}
                /mo
              </span>
            )}
            {profile.budget && profile.location && <span className="text-gray-300">·</span>}
            {profile.location && <span className="truncate">{profile.location}</span>}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleChat}
            leftIcon={<MessageCircle size={13} />}
            className="text-xs font-semibold text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
          >
            Chat
          </Button>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={openDetails}
            leftIcon={<Eye size={13} />}
            className="text-xs font-bold"
          >
            View details
          </Button>
        </div>
      </div>

      <RoommateProfileDetailModal
        profile={detailProfile}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailProfile(null);
        }}
        isLoading={detailLoading}
      />
    </>
  );
}
