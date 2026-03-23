import { z } from 'zod';

export const chatMessageSchema = z.object({
  message: z
    .string({
      required_error: 'Message is required.',
      invalid_type_error: 'Message must be a string.',
    })
    .trim()
    .min(1, 'Message is required and must not be empty.')
    .max(10_000, 'Message must not exceed 10,000 characters.'),
});
