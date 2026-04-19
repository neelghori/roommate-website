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

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema, ListingFormData } from '@/lib/validations/listing.schema';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { ImageUploader } from '@/components/features/ImageUploader';
import { useToast } from '@/hooks/useToast';
import { Amenity } from '@/types';

const LISTING_TYPE_OPTIONS = [
  { label: 'PG', value: 'PG' },
  { label: 'For Rent', value: 'Rent' },
  { label: 'Roommate', value: 'Roommate' },
  { label: 'Studio', value: 'Studio' },
  { label: 'Bachelor', value: 'Bachelor' },
  { label: 'Family', value: 'Family' },
];

const GENDER_OPTIONS = [
  { label: 'Any', value: 'Any' },
  { label: 'Male Only', value: 'Male' },
  { label: 'Female Only', value: 'Female' },
];

const AMENITY_LIST: Amenity[] = [
  'WiFi', 'AC', 'Food', 'Laundry', 'Parking', 'Gym', 'Kitchen', 'Security', 'Power Backup', 'CCTV',
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

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      spotsLeft: 1,
      genderPreference: 'Any',
      amenities: [],
    },
  });

  const watchedAmenities = watch('amenities') ?? [];

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

          {/* Room Type + Gender — 2-col */}
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  label="Room Type *"
                  options={LISTING_TYPE_OPTIONS}
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

          {/* Rent + Spots — 2-col */}
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

          {/* Location + City — 2-col */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Location / Area *"
              placeholder="e.g. Satellite, Ahmedabad"
              error={errors.location?.message}
              {...register('location')}
            />
            <Input
              label="City *"
              placeholder="e.g. Ahmedabad"
              error={errors.city?.message}
              {...register('city')}
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Amenities *
            </label>
            {errors.amenities && (
              <p className="text-xs text-red-500 mb-1.5">{errors.amenities.message as string}</p>
            )}
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {AMENITY_LIST.map((amenity) => {
                    const isChecked = (field.value as Amenity[] ?? []).includes(amenity);
                    return (
                      <Checkbox
                        key={amenity}
                        label={amenity}
                        checked={isChecked}
                        onChange={() => {
                          const current = (field.value as Amenity[]) ?? [];
                          field.onChange(
                            isChecked
                              ? current.filter((a) => a !== amenity)
                              : [...current, amenity]
                          );
                        }}
                      />
                    );
                  })}
                </div>
              )}
            />
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
            hint="Optional — 10-digit Indian mobile number"
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
