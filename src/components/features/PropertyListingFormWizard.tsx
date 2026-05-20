'use client';

/**
 * Shared 3-step property listing form (create + edit).
 * Step advances use per-step Zod picks full-form `trigger()` fails for `amenities` / partial steps.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatMaxListingImageLabel } from '@/lib/uploadLimits';
import { useAmenityMaster } from '@/hooks/useAmenityMaster';
import { useForm, Controller, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { ImageUploader } from '@/components/features/ImageUploader';
import {
  ListingGalleryEditor,
  type ListingGalleryChange,
} from '@/components/features/ListingGalleryEditor';
import { PropertyAddressFields } from '@/components/features/PropertyAddressFields';
import { ListingPeopleTypeCheckboxes } from '@/components/features/ListingPeopleTypeCheckboxes';
import { ListingRentFields } from '@/components/features/ListingRentFields';
import { PgMinimumStayField } from '@/components/features/PgMinimumStayField';
import { FURNISHING_SELECT_OPTIONS } from '@/lib/furnishing';
import { stripStudentFromPeopleTypes } from '@/lib/people-types';
import {
  listingSchema,
  validateListingWizardStep,
  type ListingFormData,
} from '@/lib/validations/listing.schema';
import { getListingTypeSelectOptionsForRole } from '@/lib/listing-type-options';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { EMPTY_STRING_ARRAY } from '@/lib/stableDefaults';

const GENDER_OPTIONS = [
  { label: 'Any', value: 'Any' },
  { label: 'Male Only', value: 'Male' },
  { label: 'Female Only', value: 'Female' },
];

const STEPS = [
  { label: 'Basic Info', description: 'Name, type, rent range & location' },
  { label: 'Details', description: 'Amenities & description' },
  { label: 'Photos & Contact', description: 'Upload photos & phone' },
];

const WIZARD_DEFAULTS: DefaultValues<ListingFormData> = {
  title: '',
  type: 'PG',
  furnishing: 'SemiFurnished',
  rentMode: 'exact',
  exactPrice: 8000,
  minPrice: 5000,
  maxPrice: 10000,
  spotsLeft: 1,
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  genderPreference: 'Any',
  peopleTypes: [],
  amenities: [],
  description: '',
  phone: '',
  youtubeUrl: '',
  minimumStayMonths: 1,
};

export type PropertyListingFormWizardProps = {
  /** e.g. edit page back link rendered above the title */
  topSlot?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Merged over wizard defaults; parent should `useMemo` + `key={listing.id}` when editing. */
  initialValues?: Partial<ListingFormData>;
  /** create: default review copy | edit: shorter copy */
  variant?: 'create' | 'edit';
  submitButtonLabel: string;
  isSubmitting?: boolean;
  /** Shown under the image uploader (edit: keep existing photos). */
  photoHint?: string;
  /** Existing gallery URLs when editing a listing. */
  initialExistingImageUrls?: string[];
  onFinish: (data: ListingFormData, gallery: ListingGalleryChange) => void | Promise<void>;
};

const DEFAULT_PHOTO_HINT = `Upload up to 5 photos. First photo is the cover. ${formatMaxListingImageLabel()} (JPEG, PNG, WebP).`;

export function PropertyListingFormWizard({
  topSlot,
  title,
  subtitle,
  initialValues,
  variant = 'create',
  submitButtonLabel,
  isSubmitting = false,
  photoHint = DEFAULT_PHOTO_HINT,
  initialExistingImageUrls = EMPTY_STRING_ARRAY,
  onFinish,
}: PropertyListingFormWizardProps) {
  const toast = useToast();
  const userRole = useAuthStore((s) => s.user?.role ?? null);
  const listingTypeOptions = useMemo(() => getListingTypeSelectOptionsForRole(userRole), [userRole]);
  const { items: masterAmenities, loading: amenitiesLoading, error: amenitiesLoadError } = useAmenityMaster();
  const [step, setStep] = useState(0);
  const [gallery, setGallery] = useState<ListingGalleryChange>({
    keptExistingUrls: initialExistingImageUrls,
    newFiles: [],
  });
  const galleryRef = useRef(gallery);
  galleryRef.current = gallery;

  const defaultValues = useMemo(
    () => ({ ...WIZARD_DEFAULTS, ...initialValues }),
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const formSeedKey = useMemo(
    () =>
      [
        initialValues?.title ?? '',
        initialValues?.youtubeUrl ?? '',
        initialValues?.phone ?? '',
        initialValues?.description?.slice(0, 80) ?? '',
      ].join('\u0001'),
    [initialValues],
  );

  useEffect(() => {
    reset({ ...WIZARD_DEFAULTS, ...initialValues });
  }, [formSeedKey, reset, initialValues]);

  useEffect(() => {
    const allowed = new Set(listingTypeOptions.map((o) => o.value));
    const cur = getValues('type');
    if (!allowed.has(cur)) {
      const next = listingTypeOptions[0]?.value ?? 'PG';
      setValue('type', next, { shouldValidate: true, shouldDirty: true });
    }
  }, [listingTypeOptions, getValues, setValue]);

  const listingType = watch('type');
  useEffect(() => {
    if (listingType !== 'PG') {
      setValue('minimumStayMonths', undefined, { shouldValidate: false });
      const cur = getValues('peopleTypes') ?? [];
      const next = stripStudentFromPeopleTypes(cur);
      if (next.length !== cur.length) {
        setValue('peopleTypes', next, { shouldValidate: true });
      }
    } else if (getValues('minimumStayMonths') == null) {
      setValue('minimumStayMonths', 1, { shouldValidate: false });
    }
  }, [listingType, setValue, getValues]);

  const handleNext = () => {
    if (step !== 0 && step !== 1) return;
    clearErrors();
    const check = validateListingWizardStep(step, getValues());
    if (!check.ok) {
      for (const { path, message } of check.issues) {
        if (path !== 'root') {
          setError(path as keyof ListingFormData, { type: 'manual', message });
        }
      }
      toast.error('Please fix this step', check.issues[0]?.message ?? '');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const existingUrlsKey = initialExistingImageUrls.join('\u0001');
  const [prevExistingUrlsKey, setPrevExistingUrlsKey] = useState(existingUrlsKey);
  if (existingUrlsKey !== prevExistingUrlsKey) {
    setPrevExistingUrlsKey(existingUrlsKey);
    setGallery((prev) => ({
      keptExistingUrls: initialExistingImageUrls,
      newFiles: prev.newFiles,
    }));
  }

  const handleCreateGalleryFiles = useCallback((files: File[]) => {
    setGallery({ keptExistingUrls: [], newFiles: files });
  }, []);

  const onSubmit = async (data: ListingFormData) => {
    await onFinish(data, galleryRef.current);
  };

  /**
   * Browsers implicitly submit a form when Enter is pressed in a single-line field if a submit
   * control exists. That was firing the API as soon as users reached step 3 (e.g. phone field).
   * Only an actual click on the submit button (or Enter while focus is on that button) should submit.
   */
  const blockImplicitEnterSubmit: React.KeyboardEventHandler<HTMLFormElement> = (e) => {
    if (e.key !== 'Enter') return;
    const t = e.target as HTMLElement;
    if (t.tagName === 'TEXTAREA') return;
    if (t.tagName === 'BUTTON') {
      const b = t as HTMLButtonElement;
      if (b.type === 'submit') return;
      return;
    }
    if (t.tagName === 'INPUT') {
      const inp = t as HTMLInputElement;
      const kind = (inp.type || 'text').toLowerCase();
      if (['submit', 'button', 'reset', 'file', 'checkbox', 'radio', 'hidden'].includes(kind)) return;
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {topSlot}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center mb-8">
        {STEPS.map((s, idx) => {
          const isDone = idx < step;
          const isActive = idx === step;
          return (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200',
                    isDone ? 'text-white' : isActive ? 'text-white' : 'bg-gray-100 text-gray-400',
                  ].join(' ')}
                  style={isDone || isActive ? { backgroundColor: '#1B8F8F' } : undefined}
                >
                  {isDone ? <Check size={16} /> : idx + 1}
                </div>
                <span
                  className={['text-[10px] mt-1 font-medium whitespace-nowrap', isActive ? '' : 'text-gray-400'].join(
                    ' ',
                  )}
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

      <div
        className="rounded-xl px-4 py-3 mb-5 text-sm font-medium"
        style={{ backgroundColor: '#EDF5F5', color: '#1B8F8F' }}
      >
        Step {step + 1} of {STEPS.length}: {STEPS[step].description}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={blockImplicitEnterSubmit} noValidate>
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
            <Controller
              name="furnishing"
              control={control}
              render={({ field }) => (
                <Select
                  label="Furnishing *"
                  options={FURNISHING_SELECT_OPTIONS}
                  placeholder="Select furnishing"
                  error={errors.furnishing?.message}
                  {...field}
                />
              )}
            />
            <ListingPeopleTypeCheckboxes
              control={control}
              errors={errors}
              listingType={listingType}
            />
            <ListingRentFields
              control={control}
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
            {listingType === 'PG' ? (
              <PgMinimumStayField register={register} errors={errors} />
            ) : null}
            <Input
              label="Total Spots *"
              type="number"
              placeholder="1"
              min={1}
              max={50}
              error={errors.spotsLeft?.message}
              {...register('spotsLeft', { valueAsNumber: true })}
            />
            <PropertyAddressFields
              register={register}
              errors={errors}
              setValue={setValue}
              control={control}
              getValues={getValues}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Amenities *</label>
              {errors.amenities && (
                <p className="text-xs text-red-500 mb-2">{errors.amenities.message as string}</p>
              )}
              {amenitiesLoading ? (
                <p className="text-sm text-gray-500 py-2">Loading amenities…</p>
              ) : amenitiesLoadError ? (
                <p className="text-xs text-red-600 py-1">{amenitiesLoadError}</p>
              ) : masterAmenities.length === 0 ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  No amenities returned from the server. You cannot complete this step until amenities are
                  configured.
                </p>
              ) : (
                <Controller
                  name="amenities"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
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
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              <p className="text-xs text-gray-400">Minimum 20 characters</p>
            </div>
            <Input
              label="YouTube video link"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              hint="Optional — saved link shows as a YouTube icon on your listing"
              error={errors.youtubeUrl?.message}
              {...register('youtubeUrl')}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Property Photos</label>
              {variant === 'edit' ? (
                <ListingGalleryEditor
                  initialExistingUrls={initialExistingImageUrls}
                  onChange={setGallery}
                />
              ) : (
                <ImageUploader onChange={handleCreateGalleryFiles} />
              )}
              <p className="text-xs text-gray-400 mt-1.5">{photoHint}</p>
            </div>
            <Input
              label="Contact Number"
              type="tel"
              placeholder="9876543210"
              hint="Optional 10-digit Indian mobile number"
              error={errors.phone?.message}
              leftIcon={<span className="text-gray-500 text-sm">+91</span>}
              {...register('phone')}
            />
            <div className="rounded-xl p-4 space-y-1.5 text-sm" style={{ backgroundColor: '#EDF5F5' }}>
              <p className="font-semibold text-gray-800 mb-2">Review before submitting</p>
              {variant === 'create' ? (
                <>
                  <p className="text-gray-600">
                    Your listing will be reviewed within{' '}
                    <span className="font-medium text-gray-800">24 hours</span> before going live.
                  </p>
                  <p className="text-gray-600">
                    Make sure your contact number is correct so interested tenants can reach you.
                  </p>
                  <p className="text-gray-600">
                    After your listing is live, open it from My Listings to add &quot;Who lives here&quot;
                    details anytime.
                  </p>
                </>
              ) : (
                <p className="text-gray-600">
                  Save when you are done. Approved listings may return to pending review after edits.
                </p>
              )}
            </div>
          </div>
        )}

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
              type="button"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="flex-1"
              onClick={() => void handleSubmit(onSubmit)()}
            >
              {submitButtonLabel}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
