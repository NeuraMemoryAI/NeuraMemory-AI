import { z } from 'zod';

const emailSchema = z
  .string({
    required_error: 'Email is required.',
    invalid_type_error: 'Email must be a string.',
  })
  .trim()
  .toLowerCase()
  .email('Please provide a valid email address.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string.',
    })
    .trim()
    .min(1, 'Password is required.'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string.',
    })
    .trim()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
});
