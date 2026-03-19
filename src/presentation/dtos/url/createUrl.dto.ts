import { FIELD_ERROR_MESSAGES } from "@/domain/errors/errors";
import { sanitizeString } from "@/shered/sanitizeString";
import z from "zod";

export const createUrlDto = z.object({
  url: z.url(FIELD_ERROR_MESSAGES.INVALID_FIELD),
  slug: z
    .string()
    .optional()
    .transform((value) => sanitizeString(value)),
  expireAt: z.coerce.date().optional()
})

export type CreateUrlDto = z.infer<typeof createUrlDto>
