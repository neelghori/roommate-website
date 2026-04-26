'use client';

/**
 * Owner-only modal to add or update one row in "Who lives here" (API `listerSnapshots[]`).
 */
import React, { useEffect, useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  listingResidentFormSchema,
  EMPTY_LISTING_RESIDENT,
  type ListingResidentFormData,
} from '@/lib/validations/listingResident.schema';
import {
  buildResidentApiPayloadFromForm,
  listingResidentToFormData,
  listingService,
  mapListerSnapshotFromApi,
  MAX_LISTING_RESIDENTS,
} from '@/services/modules/listing.service';
import type { Listing, ListingResidentSnapshot } from '@/types';
import { useToast } from '@/hooks/useToast';
import { ImageUploader } from '@/components/features/ImageUploader';

const RESIDENT_PRO_OPTIONS = [
  { label: 'Student', value: 'student' },
  { label: 'Working professional', value: 'work_professional' },
  { label: 'Freelancer', value: 'freelancer' },
  { label: 'Business', value: 'business' },
  { label: 'Other', value: 'other' },
];

const RESIDENT_GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const RESIDENT_DIET_OPTIONS = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Non-vegetarian', value: 'non_vegetarian' },
  { label: 'Eggetarian', value: 'eggetarian' },
  { label: 'Vegan', value: 'vegan' },
];

const RESIDENT_SMOKING_OPTIONS = [
  { label: 'Non-smoker', value: 'non_smoker' },
  { label: 'Smoker', value: 'smoker' },
];

export type ListingResidentEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  /** Listing title — sent as `propertyOrPgName` on each snapshot (not editable here). */
  listingTitle: string;
  /** Current residents on this listing (full list; modal writes merged array). */
  residents: ListingResidentSnapshot[];
  /** `null` = add a new resident; number = edit that index. */
  editingIndex: number | null;
  initialSnapshot?: ListingResidentSnapshot;
  onSaved: (listing: Listing) => void;
};

export function ListingResidentEditorModal({
  isOpen,
  onClose,
  propertyId,
  listingTitle,
  residents,
  editingIndex,
  initialSnapshot,
  onSaved,
}: ListingResidentEditorModalProps) {
  const toast = useToast();
  const [profileFiles, setProfileFiles] = useState<File[]>([]);
  const [profileRemoved, setProfileRemoved] = useState(false);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingResidentFormData>({
    resolver: zodResolver(listingResidentFormSchema) as Resolver<ListingResidentFormData>,
    defaultValues: EMPTY_LISTING_RESIDENT,
  });

  useEffect(() => {
    if (isOpen) {
      reset(listingResidentToFormData(initialSnapshot));
      setProfileFiles([]);
      setProfileRemoved(false);
      setUploadResetKey((k) => k + 1);
    }
  }, [isOpen, initialSnapshot, reset]);

  const onSubmit = async (data: ListingResidentFormData) => {
    try {
      let profileImageUrl: string | null | undefined;
      if (profileFiles.length > 0) {
        const { url } = await listingService.uploadListingResidentImage(profileFiles[0], propertyId);
        profileImageUrl = url;
      } else if (profileRemoved) {
        profileImageUrl = null;
      } else if (initialSnapshot?.profileImageUrl) {
        profileImageUrl = initialSnapshot.profileImageUrl;
      }

      const rawPayload = buildResidentApiPayloadFromForm(data, {
        listingTitle,
        profileImageUrl,
      });
      const snap = mapListerSnapshotFromApi(rawPayload);

      if (editingIndex === null) {
        if (!snap) {
          onClose();
          return;
        }
        if (residents.length >= MAX_LISTING_RESIDENTS) {
          toast.error(
            'Limit reached',
            `You can add at most ${MAX_LISTING_RESIDENTS} residents per listing.`,
          );
          return;
        }
        const body = { ...rawPayload };
        delete body._id;
        const updated = await listingService.addListingResident(propertyId, body);
        toast.success('Saved', 'Resident has been added to your listing.');
        onSaved(updated);
        onClose();
        return;
      }

      if (!snap) {
        toast.error('Use Remove', 'To delete someone, use the remove (trash) button in the list—not an empty save.');
        return;
      }

      const residentId = initialSnapshot?.id;
      if (!residentId) {
        toast.error(
          'Cannot update this row',
          'This resident has no server id yet. Refresh the page, or remove and add them again.',
        );
        return;
      }

      const body = { ...rawPayload };
      delete body._id;
      const updated = await listingService.patchListingResident(propertyId, residentId, body);
      toast.success('Saved', 'Resident details have been updated.');
      onSaved(updated);
      onClose();
    } catch (e) {
      toast.error('Could not save', e instanceof Error ? e.message : 'Try again.');
    }
  };

  const modalTitle =
    editingIndex === null ? 'Add resident' : 'Edit resident';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
      <p className="text-sm text-gray-600 mb-4">
        Optional details about this person. Shown publicly on your listing. The property / PG name is taken
        from your listing title automatically. To remove someone, use the trash button in the list—not an empty
        save.
      </p>
      <form
        className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit(onSubmit)();
        }}
      >
        <Input
          label="Full name"
          placeholder="Resident name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Age"
            type="number"
            min={16}
            max={120}
            placeholder="22"
            error={errors.age?.message}
            {...register('age', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                label="Gender"
                options={RESIDENT_GENDER_OPTIONS}
                placeholder="Select"
                error={errors.gender?.message}
                {...field}
              />
            )}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Profile photo</p>
          <p className="text-xs text-gray-500 mb-2">Optional. Upload a JPEG, PNG, or WebP image.</p>
          {initialSnapshot?.profileImageUrl && !profileRemoved && profileFiles.length === 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <img
                src={initialSnapshot.profileImageUrl}
                alt=""
                className="h-20 w-20 rounded-full object-cover border border-gray-200 shrink-0"
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setProfileRemoved(true);
                  setUploadResetKey((k) => k + 1);
                }}
              >
                Remove current photo
              </Button>
            </div>
          )}
          <ImageUploader
            key={uploadResetKey}
            maxImages={1}
            onChange={(files) => {
              setProfileFiles(files);
              if (files.length > 0) {
                setProfileRemoved(false);
              } else if (initialSnapshot?.profileImageUrl) {
                setProfileRemoved(true);
              }
            }}
          />
        </div>
        <Input
          label="Phone (resident)"
          type="tel"
          placeholder="9876543210"
          hint="10-digit Indian mobile"
          error={errors.phone?.message}
          leftIcon={<span className="text-gray-500 text-sm">+91</span>}
          {...register('phone')}
        />
        <Controller
          name="professionalType"
          control={control}
          render={({ field }) => (
            <Select
              label="Professional"
              options={RESIDENT_PRO_OPTIONS}
              placeholder="Select"
              error={errors.professionalType?.message}
              {...field}
            />
          )}
        />
        <Input
          label="College / company name"
          placeholder="e.g. IIT Delhi or Acme Pvt Ltd"
          error={errors.collegeOrCompanyName?.message}
          {...register('collegeOrCompanyName')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Monthly rent (their share) ₹"
            type="number"
            min={0}
            placeholder="8000"
            error={errors.monthlyRent?.message}
            {...register('monthlyRent', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          />
          <Input
            label="Security deposit ₹"
            type="number"
            min={0}
            placeholder="16000"
            error={errors.securityDeposit?.message}
            {...register('securityDeposit', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Move-in date" type="date" error={errors.moveInDate?.message} {...register('moveInDate')} />
          <Input label="Move-out date" type="date" error={errors.moveOutDate?.message} {...register('moveOutDate')} />
        </div>
        <div>
          <label htmlFor="resident-desc-modal" className="text-sm font-medium text-gray-700 block mb-1">
            About this resident
          </label>
          <textarea
            id="resident-desc-modal"
            rows={4}
            placeholder="Short description — routine, hobbies, etc."
            className={[
              'w-full rounded-xl border bg-white text-sm text-gray-900 placeholder-gray-400 px-3 py-2.5 resize-none focus:outline-none',
              errors.description ? 'border-red-400' : 'border-gray-200',
            ].join(' ')}
            {...register('description')}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="diet"
            control={control}
            render={({ field }) => (
              <Select
                label="Diet"
                options={RESIDENT_DIET_OPTIONS}
                placeholder="Select"
                error={errors.diet?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="smoking"
            control={control}
            render={({ field }) => (
              <Select
                label="Smoking"
                options={RESIDENT_SMOKING_OPTIONS}
                placeholder="Select"
                error={errors.smoking?.message}
                {...field}
              />
            )}
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              reset(EMPTY_LISTING_RESIDENT);
              setProfileRemoved(true);
              setUploadResetKey((k) => k + 1);
            }}
          >
            Clear form
          </Button>
          <Button type="button" variant="outline" size="md" className="ml-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
