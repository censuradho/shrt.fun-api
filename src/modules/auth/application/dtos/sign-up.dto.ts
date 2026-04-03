import { AUTHENTICATION_ERROR_MESSAGES } from '@/modules/auth/domain/errors/authentication.errors';
import { FIELD_ERROR_MESSAGES } from '@/shared/errors/errors';
import { sanitizeString } from '@/shared/helpers/sanitizeString';
import z from 'zod';

export const signUpDto = z.object({
  email: z.email(FIELD_ERROR_MESSAGES.INVALID_FIELD).max(255, FIELD_ERROR_MESSAGES.MAX_LENGTH(255)),
  password: z
    .string()
    .min(8, AUTHENTICATION_ERROR_MESSAGES.PASSWORD_MIN_8_CHARACTERS)
    .max(256, FIELD_ERROR_MESSAGES.MAX_LENGTH(256))
    .transform((value) => value.trim()),
  firstName: z
    .string()
    .min(1, FIELD_ERROR_MESSAGES.REQUIRED).max(100, FIELD_ERROR_MESSAGES.MAX_LENGTH(100))
    .refine((value) => !!sanitizeString(value)),
  lastName: z
    .string()
    .min(1, FIELD_ERROR_MESSAGES.REQUIRED).max(255, FIELD_ERROR_MESSAGES.MAX_LENGTH(255))
    .refine((value) => !!sanitizeString(value)),
});

export type SignUpDto = z.infer<typeof signUpDto>;
