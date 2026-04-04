import z from 'zod';
import { FIELD_ERROR_MESSAGES } from '@/shared/errors/errors';

export const updateUsernameDto = z.object({
  username: z
    .string()
    .trim()
    .transform((val) => val.replace(/^@+/, ''))
    .refine((val) => !/\s/.test(val), FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .refine((val) => val.length >= 3, FIELD_ERROR_MESSAGES.MIN_LENGTH(3))
    .refine((val) => val.length <= 30, FIELD_ERROR_MESSAGES.MAX_LENGTH(30))
    .refine((val) => /^[a-zA-Z0-9_.-]+$/.test(val), FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .transform((val) => `@${val}`),
});

export type UpdateUsernameDto = z.infer<typeof updateUsernameDto>;
