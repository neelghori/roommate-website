import { z } from 'zod';

export const LIFESTYLE_TAG_OPTIONS = [
  'Non-Smoker',
  'Vegetarian',
  'Non-Veg',
  'Early Bird',
  'Night Owl',
  'Pet Friendly',
  'Working',
  'Student',
] as const;

export const tenantRoommateProfileFormSchema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  occupation: z.string().trim().min(2, 'Occupation is required').max(120),
  location: z.string().trim().min(3, 'Location is required').max(200),
  state: z.string().trim().min(2, 'State is required').max(100),
  monthlyBudget: z
    .number({ error: 'Budget must be a number' })
    .int()
    .min(1000, 'Minimum budget is ₹1,000')
    .max(500000, 'Maximum budget is ₹5,00,000'),
  moveInDate: z.string().min(1, 'Pick a move-in date'),
  bio: z.string().trim().min(20, 'Bio must be at least 20 characters').max(2000),
  lifestyleTags: z
    .array(z.enum(LIFESTYLE_TAG_OPTIONS))
    .min(1, 'Select at least one lifestyle tag')
    .max(10),
  displayRole: z.enum(['Student', 'Working', 'Veg Only']),
});

export type TenantRoommateProfileFormData = z.infer<typeof tenantRoommateProfileFormSchema>;
