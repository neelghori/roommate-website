'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile.schema';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserAvatarImage } from '@/components/ui/UserAvatarImage';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { userService } from '@/services/modules/user.service';
import type { User } from '@/types';
import { CURRENT_USER } from '@/mock/data/users';
import { computeAgeFromDateOfBirthYmd, dateOfBirthYmdFromApi } from '@/lib/dateOfBirthAge';
import { Camera, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const LIFESTYLE_OPTIONS = [
  { value: 'STUDENT',       label: '🎓 Student' },
  { value: 'WORKING',       label: '💼 Working' },
  { value: 'VEGETARIAN',    label: '🌱 Vegetarian' },
  { value: 'NON_VEG',       label: '🍖 Non-Veg' },
  { value: 'NON_SMOKER',    label: '🚭 Non-Smoker' },
  { value: 'SMOKER',        label: '🚬 Smoker' },
  { value: 'PET_FRIENDLY',  label: '🐾 Pet Friendly' },
  { value: 'NIGHT_OWL',     label: '🦉 Night Owl' },
  { value: 'EARLY_BIRD',    label: '🐦 Early Bird' },
];

const GENDER_OPTIONS = ['Any', 'Male', 'Female'] as const;

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

function moveInDateForInput(moveInDate: string | undefined): string {
  if (!moveInDate) return '';
  const s = moveInDate.trim();
  if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function userToFormValues(u: User): ProfileFormData {
  return {
    name: u.name,
    bio: u.bio ?? '',
    location: u.location ?? '',
    budget: u.budget,
    moveInDate: moveInDateForInput(u.moveInDate),
    lifestyle: (u.lifestyle as ProfileFormData['lifestyle']) ?? [],
    genderPreference: (u.genderPreference as ProfileFormData['genderPreference']) ?? 'Any',
    dateOfBirth: dateOfBirthYmdFromApi(u.dateOfBirth),
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { user, setUser } = useAuthStore();
  const profile = user ?? CURRENT_USER;
  const isRoommate = profile.role === 'ROOMMATE';

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: userToFormValues(profile),
  });

  const dateOfBirthWatch = useWatch({ control, name: 'dateOfBirth' });
  const previewAge =
    dateOfBirthWatch && /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirthWatch)
      ? computeAgeFromDateOfBirthYmd(dateOfBirthWatch)
      : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await userService.getProfile();
        if (cancelled) return;
        setUser(u);
        reset(userToFormValues(u));
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load profile';
          toast.error('Could not load profile', msg);
        }
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast is stable; including it re-runs every render
  }, [reset, setUser]);

  const handleAvatarFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = input.files?.[0];
      input.value = '';
      if (!file) return;

      if (!AVATAR_MIME.includes(file.type as (typeof AVATAR_MIME)[number])) {
        toast.error('Unsupported image', 'Use JPEG, PNG, WebP, or GIF.');
        return;
      }
      if (file.size > AVATAR_MAX_BYTES) {
        toast.error('File too large', 'Maximum size is 5 MB.');
        return;
      }

      setIsUploadingAvatar(true);
      try {
        const { url } = await userService.uploadAvatar(file);
        const updated = await userService.updateProfile({ profileImageUrl: url });
        setUser(updated);
        toast.success('Photo updated', 'Your profile picture has been saved.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Try again.';
        toast.error('Could not update photo', msg);
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [setUser, toast],
  );

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        name: data.name,
        bio: data.bio,
        location: data.location,
        budget: data.budget,
        ...(isRoommate ? {} : { moveInDate: data.moveInDate || undefined }),
        genderPreference: data.genderPreference,
        lifestyle: data.lifestyle,
        dateOfBirth: data.dateOfBirth ?? '',
      });
      setUser(updated);
      reset(userToFormValues(updated));
      toast.success('Profile updated!', 'Your changes have been saved.');
      router.push('/profile');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      toast.error('Could not save profile', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UserLayout pageSuffix="Edit Profile" showSearch={false} showFab={false}>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {isLoadingProfile && (
          <p className="text-sm text-gray-500 text-center py-8">Loading profile…</p>
        )}

        {/* Back */}
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Profile
        </Link>

        {/* Avatar upload area */}
        <div className="flex flex-col items-center gap-3">
          <input
            ref={avatarFileInputRef}
            type="file"
            accept={AVATAR_MIME.join(',')}
            className="sr-only"
            tabIndex={-1}
            onChange={handleAvatarFileChange}
            aria-hidden
          />
          <div className="relative">
            {profile.avatarUrl ? (
              <UserAvatarImage
                src={profile.avatarUrl}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md"
                style={{ backgroundColor: '#1B8F8F' }}
              >
                {profile.avatarInitial}
              </div>
            )}
            <button
              type="button"
              disabled={isLoadingProfile || isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => avatarFileInputRef.current?.click()}
              aria-label="Change photo"
            >
              {isUploadingAvatar ? (
                <Loader2 size={14} className="text-gray-600 animate-spin" aria-hidden />
              ) : (
                <Camera size={14} className="text-gray-600" aria-hidden />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            {isUploadingAvatar ? 'Uploading…' : 'Tap camera to change photo'}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={`space-y-4 ${isLoadingProfile ? 'opacity-50 pointer-events-none' : ''}`}
        >

          {/* Basic info card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Info</h2>

            <Input
              label="Full Name *"
              placeholder="Your full name"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea
                rows={3}
                placeholder="Tell potential roommates about yourself…"
                className="w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 px-3 py-2.5 resize-none focus:outline-none focus:border-teal-400 transition-all"
                {...register('bio')}
              />
              {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
            </div>

            <Input
              label="Location"
              placeholder="e.g. Satellite, Ahmedabad"
              error={errors.location?.message}
              {...register('location')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of birth</label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-900 px-3 py-2.5 focus:outline-none focus:border-teal-400 transition-all"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message as string}</p>
              )}
              {previewAge != null && previewAge >= 16 && previewAge <= 120 && (
                <p className="text-xs text-gray-500 mt-1">Your profile will save as age {previewAge}.</p>
              )}
            </div>
          </div>

          {/* Preferences card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Preferences</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Budget (₹)</label>
              <input
                type="number"
                min={500}
                max={200000}
                placeholder="e.g. 15000"
                className="w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 px-3 py-2.5 focus:outline-none focus:border-teal-400 transition-all"
                {...register('budget', { valueAsNumber: true })}
              />
              {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget.message}</p>}
            </div>

            {!isRoommate ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Move-in Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-900 px-3 py-2.5 focus:outline-none focus:border-teal-400 transition-all"
                  {...register('moveInDate')}
                />
                {errors.moveInDate && <p className="text-xs text-red-500 mt-1">{errors.moveInDate.message}</p>}
              </div>
            ) : null}

            {/* Gender preference toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roommate Gender Preference</label>
              <Controller
                name="genderPreference"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => field.onChange(g)}
                        className="flex-1 py-2 text-sm font-medium rounded-xl border-2 transition-all"
                        style={
                          field.value === g
                            ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F', color: '#fff' }
                            : { borderColor: '#e5e7eb', color: '#6B7280' }
                        }
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Lifestyle tags card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Lifestyle</h2>
            <Controller
              name="lifestyle"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {LIFESTYLE_OPTIONS.map(({ value, label }) => {
                    const active = (field.value ?? []).includes(value as never);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          const curr = field.value ?? [];
                          field.onChange(
                            active ? curr.filter((v) => v !== value) : [...curr, value]
                          );
                        }}
                        className="px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
                        style={
                          active
                            ? { backgroundColor: '#E8F7F7', borderColor: '#1B8F8F', color: '#1B8F8F' }
                            : { borderColor: '#e5e7eb', color: '#6B7280' }
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.lifestyle && <p className="text-xs text-red-500">{errors.lifestyle.message}</p>}
          </div>

          {/* Save button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSaving}
            disabled={(!isDirty && !isSaving) || isLoadingProfile}
          >
            Save Changes
          </Button>
        </form>
      </div>
    </UserLayout>
  );
}
