/**
 * Optional "who lives here" fields — persisted as `listerSnapshot` on the property API.
 */
import { z } from 'zod';

export const RESIDENT_PROFESSIONAL_TYPES = [
  'student',
  'work_professional',
  'freelancer',
  'business',
  'other',
] as const;

export const RESIDENT_GENDERS = ['male', 'female', 'other'] as const;

export const RESIDENT_DIETS = ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan'] as const;

export const RESIDENT_SMOKING = ['non_smoker', 'smoker'] as const;

function optionalNum(min: number, max?: number) {
  return z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n)) return undefined;
    return n;
  }, max != null ? z.number().min(min).max(max).optional() : z.number().min(min).optional());
}

export const listingResidentFormSchema = z.object({
  fullName: z.string().max(120).optional().or(z.literal('')),
  age: optionalNum(16, 120),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => v === undefined || v === '' || /^[6-9]\d{9}$/.test(v), {
      message: 'Enter a valid 10-digit Indian mobile number',
    }),
  gender: z.union([z.enum(RESIDENT_GENDERS), z.literal('')]).optional(),
  professionalType: z.union([z.enum(RESIDENT_PROFESSIONAL_TYPES), z.literal('')]).optional(),
  collegeOrCompanyName: z.string().max(200).optional().or(z.literal('')),
  monthlyRent: optionalNum(0),
  securityDeposit: optionalNum(0),
  moveInDate: z.string().max(32).optional().or(z.literal('')),
  moveOutDate: z.string().max(32).optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  diet: z.union([z.enum(RESIDENT_DIETS), z.literal('')]).optional(),
  smoking: z.union([z.enum(RESIDENT_SMOKING), z.literal('')]).optional(),
});

export type ListingResidentFormData = z.infer<typeof listingResidentFormSchema>;

export const EMPTY_LISTING_RESIDENT: ListingResidentFormData = {
  fullName: '',
  age: undefined,
  phone: '',
  gender: '',
  professionalType: '',
  collegeOrCompanyName: '',
  monthlyRent: undefined,
  securityDeposit: undefined,
  moveInDate: '',
  moveOutDate: '',
  description: '',
  diet: '',
  smoking: '',
};
