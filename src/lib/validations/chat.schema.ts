/**
 * chat.schema.ts
 * Zod schemas for chat message validation.
 * Security: validate before sending to prevent injection / oversized payloads.
 */
import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 chars)')
    .transform((s) => s.trim()),
  type: z.enum(['text', 'image']).default('text'),
});

// Attachment whitelist (validated client-side before upload)
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
