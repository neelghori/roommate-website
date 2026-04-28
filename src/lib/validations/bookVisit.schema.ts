import { z } from 'zod';

export const bookVisitSchema = z.object({
  preferredDate: z.string().min(1, 'Please choose a visit date'),
  preferredTime: z.string().min(1, 'Please choose a visit time'),
  contactName: z.string().trim().min(2, 'Name is required').max(120),
  contactPhone: z
    .string()
    .trim()
    .min(10, 'Enter a valid phone number')
    .max(20),
});

export type BookVisitFormData = z.infer<typeof bookVisitSchema>;
