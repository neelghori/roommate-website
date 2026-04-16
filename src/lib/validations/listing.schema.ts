/**
 * listing.schema.ts
 * Zod validation schemas for listing creation and edit forms.
 * Security: All inputs validated before API calls.
 */
import { z } from 'zod';

const LISTING_TYPES = ['PG', 'Rent', 'Roommate', 'Studio', 'Bachelor', 'Family'] as const;
const GENDER_PREFERENCES = ['Male', 'Female', 'Any'] as const;
const AMENITIES = [
  'WiFi',
  'AC',
  'Kitchen',
  'Food',
  'Laundry',
  'Parking',
  'Gym',
  'Security',
  'Power Backup',
  'CCTV',
] as const;

export const listingSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be 100 characters or less')
    .regex(/^[a-zA-Z0-9\s\-—,.'()]+$/, 'Title contains invalid characters'),

  type: z.enum(LISTING_TYPES, {
    errorMap: () => ({ message: 'Select a valid listing type' }),
  }),

  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .positive('Price must be greater than 0')
    .min(500, 'Minimum price is ₹500')
    .max(200000, 'Maximum price is ₹2,00,000'),

  location: z
    .string()
    .min(3, 'Location is required')
    .max(150, 'Location too long')
    .regex(/^[a-zA-Z0-9\s\-,.'()]+$/, 'Location contains invalid characters'),

  city: z
    .string()
    .min(2, 'City is required')
    .max(60, 'City name too long')
    .regex(/^[a-zA-Z\s]+$/, 'City name can only contain letters and spaces'),

  spotsLeft: z
    .number({
      required_error: 'Number of spots is required',
      invalid_type_error: 'Spots must be a number',
    })
    .int('Spots must be a whole number')
    .min(1, 'At least 1 spot must be available')
    .max(50, 'Maximum 50 spots allowed'),

  genderPreference: z.enum(GENDER_PREFERENCES, {
    errorMap: () => ({ message: 'Select a valid gender preference' }),
  }),

  amenities: z
    .array(z.enum(AMENITIES))
    .min(1, 'Select at least one amenity')
    .max(10, 'Cannot exceed 10 amenities'),

  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be 2000 characters or less'),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
});

export const listingEditSchema = listingSchema.partial().extend({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be 100 characters or less')
    .optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;
export type ListingEditFormData = z.infer<typeof listingEditSchema>;
