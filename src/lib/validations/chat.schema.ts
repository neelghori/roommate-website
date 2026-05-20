/**
 * chat.schema.ts
 * Zod schemas for chat message validation.
 */
import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 chars)')
    .transform((s) => s.trim()),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
