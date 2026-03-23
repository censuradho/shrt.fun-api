import { FIELD_ERROR_MESSAGES } from "@/domain/errors/errors";
import { sanitizeString } from "@/shered/sanitizeString";
import { slugValidation, urlValidation } from "@/shered/validations";
import { isAfter } from "date-fns";
import z from "zod";

export const createUrlDto = z.object({
  url: z
    .url(FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .refine(url => urlValidation(url), FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .max(2048, FIELD_ERROR_MESSAGES.MAX_LENGTH(2048)),
  slug: z
    .string()
    .refine(slug => slugValidation(slug), FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .max(100, FIELD_ERROR_MESSAGES.MAX_LENGTH(100))
    .optional()
    .transform((value) => sanitizeString(value)),
  expireAt: z
    .coerce
    .date()
    .optional()
    .refine(date => !date || isAfter(date, new Date()), {
      message: FIELD_ERROR_MESSAGES.DATE_MUST_BE_IN_FUTURE
    })
})

export type CreateUrlDto = z.infer<typeof createUrlDto>
