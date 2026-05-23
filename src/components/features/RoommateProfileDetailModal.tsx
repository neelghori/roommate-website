'use client';

/**
 * Full roommate / seeker details in a popup (used from ProfileCard sidebar).
 */
import React from 'react';
import { MapPin, IndianRupee, Calendar, Briefcase } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { RoommateProfile } from '@/types';
import { UserAvatarImage } from '@/components/ui/UserAvatarImage';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (children == null || children === '') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3 py-2 border-b border-gray-100 last:border-0 text-sm">
      <dt className="text-gray-500 font-medium shrink-0 sm:w-36">{label}</dt>
      <dd className="text-gray-900 min-w-0 break-words">{children}</dd>
    </div>
  );
}

export type RoommateProfileDetailModalProps = {
  profile: RoommateProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
};

/** Chip colors aligned with ProfileCard for list/detail consistency. */
const LIFESTYLE_CHIP_CLASS: Record<string, string> = {
  WORKING: 'bg-amber-100 text-amber-800 border-amber-200',
  Working: 'bg-amber-100 text-amber-800 border-amber-200',
  STUDENT: 'bg-blue-100 text-blue-700 border-blue-200',
  Student: 'bg-blue-100 text-blue-700 border-blue-200',
  VEGETARIAN: 'bg-green-100 text-green-700 border-green-200',
  Vegetarian: 'bg-green-100 text-green-700 border-green-200',
  'Veg Only': 'bg-green-100 text-green-700 border-green-200',
  'Non-Smoker': 'bg-gray-100 text-gray-600 border-gray-200',
  'Non-smoker': 'bg-gray-100 text-gray-600 border-gray-200',
  NON_SMOKER: 'bg-gray-100 text-gray-600 border-gray-200',
  Smoker: 'bg-red-100 text-red-600 border-red-200',
  SMOKER: 'bg-red-100 text-red-600 border-red-200',
  'Non-Veg': 'bg-orange-100 text-orange-700 border-orange-200',
  'Non-veg': 'bg-orange-100 text-orange-700 border-orange-200',
  NON_VEG: 'bg-orange-100 text-orange-700 border-orange-200',
  'Early Bird': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  EARLY_BIRD: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Night Owl': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  NIGHT_OWL: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Pet Friendly': 'bg-purple-100 text-purple-700 border-purple-200',
  PET_FRIENDLY: 'bg-purple-100 text-purple-700 border-purple-200',
};

const DEFAULT_LIFESTYLE_CHIP = 'bg-gray-100 text-gray-600 border-gray-200';

function lifestyleTagsForDetail(profile: RoommateProfile): string[] {
  if (profile.lifestyleTags?.length) return profile.lifestyleTags;
  return profile.tags;
}

export function RoommateProfileDetailModal({
  profile,
  isOpen,
  onClose,
  isLoading,
}: RoommateProfileDetailModalProps) {
  const title = profile?.name ? profile.name : 'Roommate details';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg" showCloseButton>
      {isLoading ? (
        <div className="py-14 text-center text-sm text-gray-500">Loading profile…</div>
      ) : profile ? (
        <div className="space-y-4 -mt-1">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 bg-primary overflow-hidden"
              aria-hidden
            >
              {profile.avatarUrl ? (
                <UserAvatarImage src={profile.avatarUrl} className="h-full w-full object-cover" />
              ) : (
                profile.avatarInitial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-gray-900">{profile.name}</p>
              {profile.occupation && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {profile.occupation}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="text-secondary">★</span> {profile.matchPercent}% match
              </p>
            </div>
          </div>

          <dl className="rounded-xl border border-gray-100 bg-gray-50/60 px-3">
            <Row label="Budget">
              {profile.budget != null ? (
                <span className="inline-flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
                  {profile.budget.toLocaleString('en-IN')} / month
                </span>
              ) : null}
            </Row>
            <Row label="Location">
              {profile.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  {profile.location}
                </span>
              ) : null}
            </Row>
            <Row label="Move-in">
              {profile.moveInDate ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  {new Date(profile.moveInDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              ) : null}
            </Row>
            <Row label="Bio">{profile.bio}</Row>
            <Row label="Age">{profile.age != null ? String(profile.age) : null}</Row>
            <Row label="Gender">{profile.gender}</Row>
            <Row label="Roommate pref.">{profile.roommateGenderPreference}</Row>
            <Row label="Professional type">{profile.professionalType}</Row>
            <Row label="Account role">{profile.accountRole}</Row>
            {(() => {
              const tagList = lifestyleTagsForDetail(profile);
              const hasTags = tagList.length > 0;
              const snip = profile.lifestyleSnippet;
              const hasSnippet =
                Boolean(snip) &&
                Boolean(snip?.diet || snip?.smoking || snip?.maritalStatus);
              if (!hasTags && !hasSnippet) return null;
              return (
                <Row label="Lifestyle">
                  <div className="space-y-2">
                    {hasTags ? (
                      <div className="flex flex-wrap gap-1.5">
                        {tagList.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[11px] font-semibold rounded-full px-2 py-0.5 border ${LIFESTYLE_CHIP_CLASS[tag] ?? DEFAULT_LIFESTYLE_CHIP}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {hasSnippet ? (
                      <div className="space-y-0.5 text-sm">
                        {snip?.diet ? <div>Diet: {snip.diet}</div> : null}
                        {snip?.smoking ? <div>Smoking: {snip.smoking}</div> : null}
                        {snip?.maritalStatus ? <div>Marital: {snip.maritalStatus}</div> : null}
                      </div>
                    ) : null}
                  </div>
                </Row>
              );
            })()}
          </dl>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-gray-500">No profile to show.</div>
      )}
    </Modal>
  );
}
