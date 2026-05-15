/**
 * listing.schema.ts
 * Zod v4 validation schemas for listing creation and edit forms.
 * Security: All inputs validated before API calls.
 */
import { z } from 'zod';

/** `Rent` kept for editing legacy listings (API `room`); new forms use `Flat` / `CoWorkingSpace` instead of For Rent / Studio. */
const LISTING_TYPES = [
  'PG',
  'Rent',
  'Flat',
  'Roommate',
  'CoWorkingSpace',
  'House',
] as const;
const GENDER_PREFERENCES = ['Male', 'Female', 'Any'] as const;
const PEOPLE_TYPES = ['Bachelor', 'Working', 'Family'] as const;

const RENT_MODES = ['exact', 'range'] as const;

const rentAmountField = z
  .number({ error: 'Rent must be a number' })
  .positive('Rent must be greater than 0')
  .min(500, 'Minimum rent is ₹500')
  .max(200000, 'Maximum rent is ₹2,00,000');

function refineRent(
  data: {
    rentMode?: (typeof RENT_MODES)[number];
    exactPrice?: number;
    minPrice?: number;
    maxPrice?: number;
  },
  ctx: z.RefinementCtx,
): void {
  if (data.rentMode === 'exact') {
    if (data.exactPrice == null || Number.isNaN(data.exactPrice)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter the monthly rent',
        path: ['exactPrice'],
      });
    }
    return;
  }

  if (data.minPrice == null || Number.isNaN(data.minPrice)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter minimum rent',
      path: ['minPrice'],
    });
  }
  if (data.maxPrice == null || Number.isNaN(data.maxPrice)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter maximum rent',
      path: ['maxPrice'],
    });
  }
  if (
    typeof data.minPrice === 'number' &&
    typeof data.maxPrice === 'number' &&
    data.maxPrice < data.minPrice
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Maximum rent must be greater than or equal to minimum rent',
      path: ['maxPrice'],
    });
  }
}

const listingSchemaBase = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be 100 characters or less'),

  type: z.enum(LISTING_TYPES, { message: 'Select a valid listing type' }),

  rentMode: z.enum(RENT_MODES, { message: 'Select how rent is listed' }),

  exactPrice: rentAmountField.optional(),

  minPrice: rentAmountField.optional(),

  maxPrice: rentAmountField.optional(),

  addressLine1: z
    .string()
    .min(3, 'Address line 1 is required')
    .max(200, 'Address line 1 is too long'),

  addressLine2: z.string().max(200, 'Address line 2 is too long').optional(),

  city: z.string().min(2, 'City is required').max(100, 'City name too long'),

  state: z.string().min(2, 'State is required').max(100, 'State name too long'),

  country: z.string().min(2, 'Country is required').max(100, 'Country name too long'),

  postalCode: z.string().max(20, 'Postal code too long').optional(),

  latitude: z
    .number({ error: 'Latitude is required' })
    .finite('Enter a valid latitude')
    .gte(-90, 'Latitude must be between -90 and 90')
    .lte(90, 'Latitude must be between -90 and 90'),

  longitude: z
    .number({ error: 'Longitude is required' })
    .finite('Enter a valid longitude')
    .gte(-180, 'Longitude must be between -180 and 180')
    .lte(180, 'Longitude must be between -180 and 180'),

  placeId: z.string().max(256).optional(),
  formattedAddress: z.string().max(500).optional(),

  spotsLeft: z
    .number({ error: 'Spots must be a number' })
    .int('Spots must be a whole number')
    .min(1, 'At least 1 spot must be available')
    .max(50, 'Maximum 50 spots allowed'),

  genderPreference: z.enum(GENDER_PREFERENCES, { message: 'Select a valid gender preference' }),

  peopleTypes: z
    .array(z.enum(PEOPLE_TYPES))
    .min(1, 'Select at least one people type')
    .max(3)
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Each people type can only be selected once',
    }),

  amenities: z
    .array(z.string().trim().min(1, 'Invalid amenity').max(100))
    .min(1, 'Select at least one amenity')
    .max(40, 'Too many amenities selected'),

  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be 2000 characters or less'),

  phone: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === '' || /^[6-9]\d{9}$/.test(v), {
      message: 'Enter a valid 10-digit Indian mobile number',
    }),
});

export const listingSchema = listingSchemaBase.superRefine(refineRent);

export const listingEditSchema = listingSchemaBase.partial().superRefine(refineRent);

/** Step-wise validation for multi-step wizard (full-schema `trigger` is unreliable for arrays). */
export const listingWizardStep1Schema = listingSchemaBase.pick({
  title: true,
  type: true,
  rentMode: true,
  exactPrice: true,
  minPrice: true,
  maxPrice: true,
  spotsLeft: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  country: true,
  postalCode: true,
  latitude: true,
  longitude: true,
  genderPreference: true,
  peopleTypes: true,
}).superRefine(refineRent);

export const listingWizardStep2Schema = listingSchemaBase.pick({
  amenities: true,
  description: true,
});

export type ListingFormData = z.infer<typeof listingSchema>;
export type ListingEditFormData = z.infer<typeof listingEditSchema>;

/** Maps form rent fields to API `rentRange`. */
export function resolveListingRentRange(
  data: Partial<Pick<ListingFormData, 'rentMode' | 'exactPrice' | 'minPrice' | 'maxPrice'>>,
): { min: number; max: number } {
  const mode =
    data.rentMode ??
    (data.exactPrice != null && data.minPrice == null && data.maxPrice == null ? 'exact' : 'range');
  if (mode === 'exact') {
    const p = (data.exactPrice ?? data.minPrice ?? data.maxPrice) as number;
    return { min: p, max: p };
  }
  const min = (data.minPrice ?? data.exactPrice) as number;
  const max = (data.maxPrice ?? data.minPrice ?? data.exactPrice) as number;
  return { min, max: Math.max(min, max) };
}

export { EMPTY_LISTING_RESIDENT } from '@/lib/validations/listingResident.schema';
export type { ListingResidentFormData } from '@/lib/validations/listingResident.schema';

export function validateListingWizardStep(
  step: 0 | 1,
  values: Partial<ListingFormData>,
): { ok: true } | { ok: false; issues: { path: string; message: string }[] } {
  const schema = step === 0 ? listingWizardStep1Schema : listingWizardStep2Schema;
  const result = schema.safeParse(values);
  if (result.success) return { ok: true };
  const issues = result.error.issues.map((i) => ({
    path: i.path[0] != null ? String(i.path[0]) : 'root',
    message: i.message,
  }));
  return { ok: false, issues };
}
