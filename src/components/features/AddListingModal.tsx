/**
 * AddListingModal.tsx
 * "Post New Listing" modal with full form validation.
 *
 * Form fields: title, type, price, location, city, spots, gender, amenities, description, phone
 * Validation: React Hook Form + Zod listingSchema
 * On submit: shows success toast + closes modal
 *
 * BACKEND INTEGRATION:
 * - Submit: POST /listings (multipart/form-data with images)
 */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAmenityMaster } from '@/hooks/useAmenityMaster';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema, ListingFormData } from '@/lib/validations/listing.schema';
import { getListingTypeSelectOptionsForRole } from '@/lib/listing-type-options';
import { useAuthStore } from '@/store/authStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { ImageUploader } from '@/components/features/ImageUploader';
import { PropertyAddressFields } from '@/components/features/PropertyAddressFields';
import { useToast } from '@/hooks/useToast';

const GENDER_OPTIONS = [
  { label: 'Any', value: 'Any' },
  { label: 'Male Only', value: 'Male' },
  { label: 'Female Only', value: 'Female' },
];

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after successful mock submission */
  onSuccess?: (data: ListingFormData) => void;
}

export const AddListingModal: React.FC<AddListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const userRole = useAuthStore((s) => s.user?.role ?? null);
  const listingTypeOptions = useMemo(() => getListingTypeSelectOptionsForRole(userRole), [userRole]);
  const { items: masterAmenities, loading: amenitiesLoading, error: amenitiesLoadError } = useAmenityMaster();

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: 'PG',
      spotsLeft: 1,
      genderPreference: 'Any',
      amenities: [],
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
    },
  });

  useEffect(() => {
    const allowed = new Set(listingTypeOptions.map((o) => o.value));
    const cur = getValues('type');
    if (!allowed.has(cur)) {
      const next = listingTypeOptions[0]?.value ?? 'PG';
      setValue('type', next, { shouldValidate: true, shouldDirty: true });
    }
  }, [listingTypeOptions, getValues, setValue]);

  const handleClose = () => {
    reset();
    setUploadedImages([]);
    onClose();
  };

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true);
    // MOCK: simulate API delay
    // BACKEND: const formData = new FormData(); append images + JSON fields; await listingService.createListing(formData)
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    toast.success(
      'Listing Posted!',
      'Your listing has been submitted for review. It will be live within 24 hours.'
    );
    onSuccess?.(data);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="📋 Post New Listing" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Image uploader */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Property Photos
          </label>
          <ImageUploader onChange={setUploadedImages} />
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-4">
          {/* Property Name */}
          <Input
            label="Property Name *"
            placeholder="e.g. Spacious PG Near SG Highway"
            error={errors.title?.message}
            {...register('title')}
          />

          {/* Room Type + Gender 2-col */}
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  label="Room Type *"
                  options={listingTypeOptions}
                  placeholder="Select type"
                  error={errors.type?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="genderPreference"
              control={control}
              render={({ field }) => (
                <Select
                  label="Gender Preference *"
                  options={GENDER_OPTIONS}
                  error={errors.genderPreference?.message}
                  {...field}
                />
              )}
            />
          </div>

          {/* Rent + Spots 2-col */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Rent Per Month ₹ *"
              type="number"
              placeholder="8500"
              error={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
            />
            <Input
              label="Total Spots *"
              type="number"
              placeholder="1"
              min={1}
              max={50}
              error={errors.spotsLeft?.message}
              {...register('spotsLeft', { valueAsNumber: true })}
            />
          </div>

          <PropertyAddressFields register={register} errors={errors} setValue={setValue} />

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Amenities *
            </label>
            {errors.amenities && (
              <p className="text-xs text-red-500 mb-1.5">{errors.amenities.message as string}</p>
            )}
            {amenitiesLoading ? (
              <p className="text-sm text-gray-500 py-2">Loading amenities…</p>
            ) : amenitiesLoadError ? (
              <p className="text-xs text-red-600">{amenitiesLoadError}</p>
            ) : masterAmenities.length === 0 ? (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                No amenities available from the server.
              </p>
            ) : (
              <Controller
                name="amenities"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {masterAmenities.map((a) => {
                      const name = a.name.trim();
                      const norm = (s: string) => s.trim().toLowerCase();
                      const current = (field.value as string[]) ?? [];
                      const isChecked = current.some((x) => norm(x) === norm(name));
                      return (
                        <Checkbox
                          key={a._id}
                          label={name}
                          checked={isChecked}
                          onChange={() => {
                            const without = current.filter((x) => norm(x) !== norm(name));
                            field.onChange(isChecked ? without : [...without, name]);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              />
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the property, house rules, nearby landmarks..."
              className={[
                'w-full rounded-xl border bg-white text-sm text-gray-900 placeholder-gray-400 px-3 py-2.5 transition-all resize-none',
                'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
                errors.description ? 'border-red-400' : 'border-gray-200',
              ].join(' ')}
              aria-invalid={!!errors.description}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Contact Number */}
          <Input
            label="Contact Number"
            type="tel"
            placeholder="9876543210"
            hint="Optional 10-digit Indian mobile number"
            error={errors.phone?.message}
            leftIcon={<span className="text-gray-500 text-sm">+91</span>}
            {...register('phone')}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className="mt-2"
        >
          Post Listing
        </Button>
      </form>
    </Modal>
  );
};
