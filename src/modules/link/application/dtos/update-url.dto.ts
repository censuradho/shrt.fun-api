import { sanitizeString } from '@/shared/helpers/sanitizeString';
import z from 'zod';
import { FIELD_ERROR_MESSAGES } from '@/shared/errors/errors';

export const updateUrlDto = z.object({
  title: z
    .string()
    .max(255, FIELD_ERROR_MESSAGES.MAX_LENGTH(255))
    .optional()
    .transform((value) => sanitizeString(value)),
  description: z
    .string()
    .max(500, FIELD_ERROR_MESSAGES.MAX_LENGTH(500))
    .optional()
    .transform((value) => sanitizeString(value)),
  tags: z
    .array(z.string().max(50, FIELD_ERROR_MESSAGES.MAX_LENGTH(50)))
    .max(10, FIELD_ERROR_MESSAGES.MAX_LENGTH(10))
    .optional(),
  expireAt: z.coerce.date().nullable().optional(),
});

export type UpdateUrlDto = z.infer<typeof updateUrlDto>;
