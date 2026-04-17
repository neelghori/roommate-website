/**
 * profile.schema.ts
 * Zod v4 validation schemas for user profile update forms.
 */
import { z } from 'zod';

const GENDER_PREFERENCES = ['Male', 'Female', 'Any'] as const;
const LIFESTYLE_TAGS = [
  'STUDENT', 'WORKING', 'VEGETARIAN', 'NON_VEG',
  'SMOKER', 'NON_SMOKER', 'PET_FRIENDLY', 'NIGHT_OWL', 'EARLY_BIRD',
] as const;

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or less')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().or(z.literal('')),

  location: z
    .string()
    .max(100, 'Location must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Zod v4: use `error` instead of `invalid_type_error`
  budget: z
    .number({ error: 'Budget must be a number' })
    .positive('Budget must be greater than 0')
    .min(500, 'Minimum budget is ₹500')
    .max(200000, 'Maximum budget is ₹2,00,000')
    .optional(),

  moveInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date (YYYY-MM-DD)')
    .refine(
      (date) => {
        const parsed = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return parsed >= today;
      },
      { message: 'Move-in date must be today or in the future' },
    )
    .optional()
    .or(z.literal('')),

  genderPreference: z
    .enum(GENDER_PREFERENCES, { message: 'Select a valid gender preference' })
    .optional(),

  lifestyle: z
    .array(z.enum(LIFESTYLE_TAGS))
    .max(9, 'Cannot select more than 9 lifestyle tags')
    .optional()
    .default([]),
});

export const phoneVerificationSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PhoneVerificationFormData = z.infer<typeof phoneVerificationSchema>;
