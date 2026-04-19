'use client';

/**
 * Edit Listing page — src/app/(user)/listings/[id]/edit/page.tsx
 * Multi-step edit form pre-populated with existing listing data.
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { ImageUploader } from '@/components/features/ImageUploader';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { listingSchema, ListingFormData } from '@/lib/validations/listing.schema';
import { useToast } from '@/hooks/useToast';
import { MOCK_LISTINGS } from '@/mock/data';
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

const STEPS = [
  { label: 'Basic Info', description: 'Name, type, price & location' },
  { label: 'Details', description: 'Amenities & description' },
  { label: 'Photos & Contact', description: 'Update photos & phone' },
];

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params?.id as string;

  const listing = MOCK_LISTINGS.find((l) => l.id === id);

  const [step, setStep] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<ListingFormData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: listing
      ? {
          title: listing.title,
          type: listing.type,
          price: listing.price,
          spotsLeft: listing.spotsLeft,
          location: listing.location,
          city: listing.city,
          genderPreference: listing.genderPreference,
          amenities: listing.amenities,
          description: listing.description,
          phone: listing.ownerPhone?.replace(/^\+91\s?/, '').replace(/\s/g, '') ?? '',
        }
      : {
          spotsLeft: 1,
          genderPreference: 'Any',
          amenities: [],
        },
    mode: 'onTouched',
  });

  const stepFields: (keyof ListingFormData)[][] = [
    ['title', 'type', 'price', 'spotsLeft', 'location', 'city', 'genderPreference'],
    ['amenities', 'description'],
    ['phone'],
  ];

  const handleNext = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = (data: ListingFormData) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingData) return;
    setShowConfirm(false);
    setIsSubmitting(true);
    // BACKEND: PUT /listings/{id} with updated data
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    toast.success('Listing Updated!', 'Your changes have been saved successfully.');
    router.push('/my-listings');
  };

  if (!listing) {
    return (
      <UserLayout pageSuffix="Edit Listing" showFab={false}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <EmptyState
            title="Listing not found"
            description="We could not find this listing to edit."
            actionLabel="My Listings"
            onAction={() => router.push('/my-listings')}
          />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout pageSuffix="Edit Listing" showSearch={false} showFab={false}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">✏️ Edit Listing</h1>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{listing.title}</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, idx) => {
            const isDone = idx < step;
            const isActive = idx === step;
            return (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={[
                      'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200',
                      isDone
                        ? 'text-white'
                        : isActive
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-400',
                    ].join(' ')}
                    style={isDone || isActive ? { backgroundColor: '#1B8F8F' } : undefined}
                  >
                    {isDone ? <Check size={16} /> : idx + 1}
                  </div>
                  <span
                    className={[
                      'text-[10px] mt-1 font-medium whitespace-nowrap',
                      isActive ? '' : 'text-gray-400',
                    ].join(' ')}
                    style={isActive ? { color: '#1B8F8F' } : undefined}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-2 mt-[-18px] transition-all duration-200"
                    style={{ backgroundColor: idx < step ? '#1B8F8F' : '#E5E7EB' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step hint */}
        <div
          className="rounded-xl px-4 py-3 mb-5 text-sm font-medium"
          style={{ backgroundColor: '#EDF5F5', color: '#1B8F8F' }}
        >
          Step {step + 1} of {STEPS.length}: {STEPS[step].description}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* STEP 1 */}
          {step === 0 && (
            <div className="space-y-4">
              <Input
                label="Property Name *"
                placeholder="e.g. Spacious PG Near SG Highway"
                error={errors.title?.message}
                {...register('title')}
              />
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
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Rent / Month ₹ *"
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
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Amenities *
                </label>
                {errors.amenities && (
                  <p className="text-xs text-red-500 mb-2">{errors.amenities.message as string}</p>
                )}
                <Controller
                  name="amenities"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {AMENITY_LIST.map((amenity) => {
                        const isChecked = ((field.value as Amenity[]) ?? []).includes(amenity);
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

              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Describe the property, house rules, nearby landmarks..."
                  className={[
                    'w-full rounded-xl border bg-white text-sm text-gray-900 placeholder-gray-400 px-3 py-2.5 transition-all resize-none focus:outline-none',
                    errors.description ? 'border-red-400' : 'border-gray-200',
                  ].join(' ')}
                  onFocus={(e) => {
                    if (!errors.description) {
                      e.currentTarget.style.borderColor = '#1B8F8F';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27,143,143,0.15)';
                    }
                  }}
                  aria-invalid={!!errors.description}
                  {...register('description', {
                    onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
                      e.currentTarget.style.borderColor = errors.description ? '#f87171' : '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Property Photos
                </label>
                <ImageUploader onChange={setUploadedImages} />
                <p className="text-xs text-gray-400 mt-1.5">
                  Leave empty to keep existing photos.
                </p>
              </div>

              <Input
                label="Contact Number"
                type="tel"
                placeholder="9876543210"
                hint="Optional — 10-digit Indian mobile number"
                error={errors.phone?.message}
                leftIcon={<span className="text-gray-500 text-sm">+91</span>}
                {...register('phone')}
              />

              <div
                className="rounded-xl p-4 text-sm"
                style={{ backgroundColor: '#EDF5F5', color: '#1B8F8F' }}
              >
                <p className="font-semibold mb-1">Ready to save changes?</p>
                <p className="text-gray-600 text-xs">
                  A confirmation dialog will appear before your changes are saved.
                </p>
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBack}
                leftIcon={<ChevronLeft size={16} />}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleNext}
                rightIcon={<ChevronRight size={16} />}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Update Listing
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* ── Confirm Save Dialog ────────────────────────────────────── */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Save Changes?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFF3E0' }}
            >
              <AlertTriangle size={20} style={{ color: '#F57C00' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Confirm Update
              </p>
              <p className="text-sm text-gray-500">
                Are you sure you want to save the changes to{' '}
                <span className="font-medium text-gray-700">"{listing.title}"</span>?
                The listing will be re-reviewed if major details changed.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSubmitting}
              onClick={handleConfirmSave}
            >
              Yes, Save
            </Button>
          </div>
        </div>
      </Modal>
    </UserLayout>
  );
}
