'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile.schema';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { CURRENT_USER } from '@/mock/data/users';
import { Camera, ArrowLeft } from 'lucide-react';
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

export default function EditProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { user, setUser } = useAuthStore();
  const profile = user ?? CURRENT_USER;

  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      budget: profile.budget,
      lifestyle: (profile.lifestyle as ProfileFormData['lifestyle']) ?? [],
      genderPreference: (profile.genderPreference as ProfileFormData['genderPreference']) ?? 'Any',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    // BACKEND: await userService.updateProfile(data)
    await new Promise((r) => setTimeout(r, 800));

    // Merge updated fields into store
    if (user) {
      setUser({
        ...user,
        name: data.name,
        bio: data.bio ?? user.bio,
        location: data.location ?? user.location,
        budget: data.budget ?? user.budget,
        lifestyle: (data.lifestyle ?? user.lifestyle) as typeof user.lifestyle,
      });
    }

    setIsSaving(false);
    toast.success('Profile updated!', 'Your changes have been saved.');
    router.push('/profile');
  };

  return (
    <UserLayout pageSuffix="Edit Profile" showSearch={false} showFab={false}>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">

        {/* Back */}
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Profile
        </Link>

        {/* Avatar upload area */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              {profile.avatarInitial}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50"
              onClick={() => toast.info('Photo upload coming soon', 'This feature will be available after backend integration.')}
              aria-label="Change photo"
            >
              <Camera size={14} className="text-gray-600" />
            </button>
          </div>
          <p className="text-xs text-gray-400">Tap camera to change photo</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Move-in Date</label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-900 px-3 py-2.5 focus:outline-none focus:border-teal-400 transition-all"
                {...register('moveInDate')}
              />
              {errors.moveInDate && <p className="text-xs text-red-500 mt-1">{errors.moveInDate.message}</p>}
            </div>

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
            disabled={!isDirty && !isSaving}
          >
            Save Changes
          </Button>
        </form>
      </div>
    </UserLayout>
  );
}
