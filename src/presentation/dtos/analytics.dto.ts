import z from "zod";

export const topMostAccessedUrlsQueryDto = z.object({
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type TopMostAccessedUrlsQueryDto = z.infer<typeof topMostAccessedUrlsQueryDto>