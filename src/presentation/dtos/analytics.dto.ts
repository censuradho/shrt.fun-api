import { FIELD_ERROR_MESSAGES } from "@/domain/errors/errors";
import z from "zod";

export const topMostAccessedUrlsQueryDto = z.object({
  limit: z.coerce.number().max(10, FIELD_ERROR_MESSAGES.MAX_VALUE(10)).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type TopMostAccessedUrlsQueryDto = z.infer<typeof topMostAccessedUrlsQueryDto>