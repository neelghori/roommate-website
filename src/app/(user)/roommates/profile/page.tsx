'use client';

/**
 * Tenant roommate seeker profile create/edit (API: PUT /api/v1/tenant-roommate-profiles/me).
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import {
  tenantRoommateProfileFormSchema,
  type TenantRoommateProfileFormData,
  LIFESTYLE_TAG_OPTIONS,
} from '@/lib/validations/tenantRoommateProfile.schema';
import { tenantRoommateProfileService } from '@/services/modules/tenantRoommateProfile.service';

const ROLE_OPTIONS = [
  { label: 'Student', value: 'Student' },
  { label: 'Working professional', value: 'Working' },
  { label: 'Veg only (preference)', value: 'Veg Only' },
];

const INDIAN_STATES = [
  { label: 'Select State', value: '' },
  { label: 'Gujarat', value: 'Gujarat' },
  { label: 'Maharashtra', value: 'Maharashtra' },
  { label: 'Delhi', value: 'Delhi' },
  { label: 'Karnataka', value: 'Karnataka' },
  { label: 'Rajasthan', value: 'Rajasthan' },
  { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
  { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
  { label: 'Tamil Nadu', value: 'Tamil Nadu' },
  { label: 'Telangana', value: 'Telangana' },
  { label: 'West Bengal', value: 'West Bengal' },
  { label: 'Haryana', value: 'Haryana' },
  { label: 'Punjab', value: 'Punjab' },
  { label: 'Goa', value: 'Goa' },
  { label: 'Kerala', value: 'Kerala' },
  { label: 'Other', value: 'Other' },
];

const defaultValues: TenantRoommateProfileFormData = {
  displayName: '',
  occupation: '',
  location: '',
  state: '',
  monthlyBudget: 10000,
  moveInDate: '',
  bio: '',
  lifestyleTags: [],
  displayRole: 'Working',
};

export default function TenantRoommateProfilePage() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const user = useAuthStore((s) => s.user);
  const isTenant = user?.role === 'TENANT' || user?.role === 'ROOMMATE';

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TenantRoommateProfileFormData>({
    resolver: zodResolver(tenantRoommateProfileFormSchema),
    defaultValues,
    mode: 'onTouched',
  });

  useEffect(() => {
    if (!isTenant) return;
    let cancelled = false;
    setLoadState('loading');
    tenantRoommateProfileService
      .getMine()
      .then((p) => {
        if (cancelled) return;
        if (p) {
          reset({
            displayName: p.displayName,
            occupation: p.occupation,
            location: p.location,
            state: p.state || '',
            monthlyBudget: p.monthlyBudget,
            moveInDate: p.moveInDate.slice(0, 10),
            bio: p.bio,
            lifestyleTags: p.lifestyleTags as TenantRoommateProfileFormData['lifestyleTags'],
            displayRole: p.displayRole,
          });
        } else {
          const nm = useAuthStore.getState().user?.name?.trim() || '';
          reset({
            ...defaultValues,
            displayName: nm,
          });
        }
        setLoadState('ready');
      })
      .catch((e) => {
        if (!cancelled) {
          toastError('Could not load profile', e instanceof Error ? e.message : 'Try again');
          setLoadState('ready');
        }
      });
    return () => {
      cancelled = true;
    };
    // Intentionally omit `reset` / toast: fetch once per tenant session (user id), not on every RHF or toast identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTenant, user?.id]);

  const onSubmit = async (data: TenantRoommateProfileFormData) => {
    setSubmitting(true);
    try {
      await tenantRoommateProfileService.saveMine({
        ...data,
        moveInDate: new Date(`${data.moveInDate}T12:00:00`).toISOString(),
      });
      toastSuccess('Profile saved', 'Other tenants can now find you on Find Roommates.');
      router.push('/roommates');
    } catch (e) {
      toastError('Save failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isTenant) {
    return (
      <UserLayout pageSuffix="Roommate profile" showSearch={false} showFab={false}>
        <div className="max-w-lg mx-auto px-4 py-10 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Roommate profile</h1>
          <p className="text-sm text-gray-600 mb-6">
            Only tenant accounts can publish a &quot;looking for a roommate&quot; profile. Owners list properties from My
            Listings.
          </p>
          <Link
            href="/roommates"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: '#1B8F8F' }}
          >
            Browse roommates
          </Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout pageSuffix="Roommate profile" showSearch={false} showFab={false}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <h1 className="text-xl font-bold text-gray-900">Your roommate profile</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Tell others who you are, your budget, and when you want to move in. This appears on Find Roommates.
        </p>

        {loadState === 'loading' ? (
          <p className="text-sm text-gray-500 py-8">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Display name *"
              placeholder="e.g. Arjun Sharma"
              error={errors.displayName?.message}
              {...register('displayName')}
            />

            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  label="State *"
                  options={INDIAN_STATES}
                  error={errors.state?.message}
                  {...field}
                />
              )}
            />

            <Input
              label="Occupation *"
              placeholder="e.g. Software Engineer, MBA Student"
              error={errors.occupation?.message}
              {...register('occupation')}
            />

            <Controller
              name="displayRole"
              control={control}
              render={({ field }) => (
                <Select
                  label="Profile type *"
                  options={ROLE_OPTIONS}
                  error={errors.displayRole?.message}
                  {...field}
                />
              )}
            />

            <Input
              label="Preferred area / city *"
              placeholder="e.g. Navrangpura, Ahmedabad"
              error={errors.location?.message}
              {...register('location')}
            />

            <Input
              label="Monthly budget (₹) *"
              type="number"
              min={1000}
              step={500}
              error={errors.monthlyBudget?.message}
              {...register('monthlyBudget', { valueAsNumber: true })}
            />

            <Input label="Move-in date *" type="date" error={errors.moveInDate?.message} {...register('moveInDate')} />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Lifestyle tags *</label>
              {errors.lifestyleTags && (
                <p className="text-xs text-red-500 mb-2">{errors.lifestyleTags.message as string}</p>
              )}
              <Controller
                name="lifestyleTags"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {LIFESTYLE_TAG_OPTIONS.map((tag) => {
                      const selected = (field.value ?? []).includes(tag);
                      return (
                        <Checkbox
                          key={tag}
                          label={tag}
                          checked={selected}
                          onChange={() => {
                            const cur = field.value ?? [];
                            field.onChange(selected ? cur.filter((t) => t !== tag) : [...cur, tag]);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="bio" className="text-sm font-medium text-gray-700">
                About you *
              </label>
              <textarea
                id="bio"
                rows={5}
                placeholder="Describe yourself, schedule, and what kind of flatmate you are looking for…"
                className={[
                  'w-full rounded-xl border bg-white text-sm text-gray-900 placeholder-gray-400 px-3 py-2.5 transition-all resize-none focus:outline-none',
                  errors.bio ? 'border-red-400' : 'border-gray-200',
                ].join(' ')}
                {...register('bio')}
              />
              {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
              <p className="text-xs text-gray-400">At least 20 characters</p>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={submitting}>
              Save profile
            </Button>
          </form>
        )}
      </div>
    </UserLayout>
  );
}
