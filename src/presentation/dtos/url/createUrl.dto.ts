import { FIELD_ERROR_MESSAGES } from "@/domain/errors/errors";
import { sanitizeString } from "@/shered/sanitizeString";
import z from "zod";

export const createUrlDto = z.object({
  url: z.url(FIELD_ERROR_MESSAGES.REQUIRED),
  slug: z
    .string()
    .optional()
    .transform((value) => sanitizeString(value))
})

export type CreateUrlDto = z.infer<typeof createUrlDto>
