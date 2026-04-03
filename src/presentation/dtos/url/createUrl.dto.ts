import { FIELD_ERROR_MESSAGES } from "@/domain/errors/errors";
import { sanitizeString } from "@/shered/sanitizeString";
import { slugValidation, slugNotBanned, urlValidation } from "@/shered/validations";
import { base64MaxSize } from "@/shered/base64MaxSize";
import z from "zod";

const MAX_CENTER_LOGO_SIZE = base64MaxSize(2 * 1024 * 1024) // 2MB

export const qrOptionsDto = z.object({
  dotsStyle: z.enum(['square', 'rounded', 'dots', 'classy', 'classy-rounded', 'extra-rounded', 'mixed', 'fluid']).optional(),
  dotsColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, FIELD_ERROR_MESSAGES.INVALID_FIELD).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, FIELD_ERROR_MESSAGES.INVALID_FIELD).optional(),
  cornersSquareStyle: z.enum(['dot', 'square', 'extra-rounded']).optional(),
  cornersDotStyle: z.enum(['dot', 'square']).optional(),
  centerLogo: z
    .string()
    .regex(/^data:image\/(png|jpeg|jpg);base64,[A-Za-z0-9+/]+=*$/, FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .max(MAX_CENTER_LOGO_SIZE, FIELD_ERROR_MESSAGES.MAX_FILE_SIZE(MAX_CENTER_LOGO_SIZE))
    .optional(),
  watermarkLogo: z
    .string()
    .regex(/^data:image\/(png|jpeg|jpg);base64,[A-Za-z0-9+/]+=*$/, FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .max(MAX_CENTER_LOGO_SIZE, FIELD_ERROR_MESSAGES.MAX_FILE_SIZE(MAX_CENTER_LOGO_SIZE))
    .optional(),
  hideWatermark: z.boolean().optional(),
}).optional()

export const createUrlDto = z.object({
  url: z
    .url(FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .refine(url => urlValidation(url), FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .max(2048, FIELD_ERROR_MESSAGES.MAX_LENGTH(2048)),
  slug: z
    .string()
    .refine(slug => slugValidation(slug), FIELD_ERROR_MESSAGES.INVALID_FIELD)
    .refine(slug => slugNotBanned(slug), FIELD_ERROR_MESSAGES.INVALID_FIELD)
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
