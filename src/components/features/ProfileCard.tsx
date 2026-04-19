/**
 * ProfileCard.tsx
 * Compact card showing a roommate's profile.
 * Shown in the "Find Roommate" right sidebar and Suggested Roommates page.
 *
 * From mockup: Avatar with initials, name, match %, tags (WORKING, VEGETARIAN, Non-smoker),
 * "Chat" button (outlined) and "Connected" button (teal filled).
 *
 * BACKEND INTEGRATION:
 * - Connect: POST /users/{id}/connect
 * - Disconnect: DELETE /users/{id}/connect
 * - Chat: navigate to /chat/{userId}
 */
'use client';

import React, { useState } from 'react';
import { Star, MessageCircle, UserCheck, UserPlus } from 'lucide-react';
import { RoommateProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

// Tag color map — matches mockup color coding
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
  const [isConnected, setIsConnected] = useState(profile.isConnected);
  const [isConnecting, setIsConnecting] = useState(false);
  const toast = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    // BACKEND: isConnected
    //   ? await userService.disconnect(profile.userId)
    //   : await userService.connect(profile.userId)
    await new Promise((r) => setTimeout(r, 700));
    const next = !isConnected;
    setIsConnected(next);
    setIsConnecting(false);
    toast.success(
      next ? `Connected with ${profile.name}!` : `Disconnected from ${profile.name}`,
      next ? 'You can now chat with each other.' : undefined
    );
  };

  const handleChat = () => {
    // BACKEND: navigate to /chat/{profile.userId}
    onChatClick?.(profile);
    toast.info('Opening chat...', `Starting conversation with ${profile.name}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-col gap-2.5">
      {/* Top row: avatar + name + match % */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-primary"
          aria-label={`${profile.name}'s avatar`}
        >
          {profile.avatarInitial}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{profile.name}</p>
          {profile.occupation && (
            <p className="text-xs text-gray-500 truncate">{profile.occupation}</p>
          )}
        </div>

        {/* Match % */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Star size={11} className="text-secondary fill-secondary" />
          <span className="text-xs font-semibold text-gray-700">{profile.matchPercent}%</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {profile.tags.slice(0, 3).map((tag) => (
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

      {/* Budget + location (if available) */}
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

      {/* Action buttons */}
      <div className="flex gap-2">
        {isConnected ? (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleChat}
            leftIcon={<MessageCircle size={14} />}
            className="text-xs font-bold h-9 shadow-sm"
          >
            Chat Now
          </Button>
        ) : (
          <>
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
              isLoading={isConnecting}
              onClick={handleConnect}
              leftIcon={!isConnecting && <UserPlus size={13} />}
              className="text-xs font-bold"
            >
              Connect
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
