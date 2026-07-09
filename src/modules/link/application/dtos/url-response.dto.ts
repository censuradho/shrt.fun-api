import z from 'zod';

export const urlModelResponseDto = z
  .object({
    id: z.string(),
    originalUrl: z.string(),
    shortUrl: z.string(),
    title: z.string().nullable().optional(),
    hitsCount: z.number(),
    isActive: z.boolean(),
    description: z.string().nullable().optional(),
    tags: z.array(z.string()),
    expireAt: z.date().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    hasQrCode: z.boolean(),
    qrCodeOptions: z.any().nullable().optional(),
  })
  .loose();

export const createShortUrlResponseDto = z
  .object({
    shortUrl: z.string(),
    qrCode: z.string().optional(),
  })
  .loose();

export const createAnonymousShortUrlResponseDto = z
  .object({
    shortUrl: z.string(),
  })
  .loose();

export const findManyLinksPaginatedResponseDto = z
  .object({
    data: z.array(urlModelResponseDto),
    nextCursor: z.string().nullable(),
  })
  .loose();

export const toggleUrlActiveResponseDto = z
  .object({
    isActive: z.boolean(),
  })
  .loose();

export const publicStatsResponseDto = z
  .object({
    totalUrls: z.number(),
    totalClicks: z.number(),
  })
  .loose();

export const qrCodeResponseDto = z
  .object({
    qrCode: z.string(),
  })
  .loose();
