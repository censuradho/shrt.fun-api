import { FIELD_ERROR_MESSAGES } from "@/domain/errors/errors";
import { sanitizeString } from "@/shered/sanitizeString";
import { slugValidation, urlValidation } from "@/shered/validations";
import z from "zod";

const qrOptionsDto = z.object({
  dotsStyle: z.enum(['square', 'rounded', 'dots', 'classy', 'classy-rounded', 'extra-rounded', 'mixed', 'fluid']).optional(),
  dotsColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, FIELD_ERROR_MESSAGES.INVALID_FIELD).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, FIELD_ERROR_MESSAGES.INVALID_FIELD).optional(),
  cornersSquareStyle: z.enum(['dot', 'square', 'extra-rounded']).optional(),
  cornersDotStyle: z.enum(['dot', 'square']).optional(),
  centerLogo: z.string().optional(),
  watermarkLogo: z.string().optional(),
}).optional()

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
  title: z
    .string()
    .max(255, FIELD_ERROR_MESSAGES.MAX_LENGTH(255))
    .optional()
    .transform((value) => sanitizeString(value)),
  generateQrCode: z.boolean().optional().default(false),
  qrOptions: qrOptionsDto,
})

export type CreateUrlDto = z.infer<typeof createUrlDto>
