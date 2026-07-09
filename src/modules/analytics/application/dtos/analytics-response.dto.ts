import z from 'zod';

export const locationAnalyticsResponseDto = z.array(
  z
    .object({
      country: z.string().nullable(),
      city: z.string().nullable(),
      clicks: z.number(),
    })
    .passthrough(),
);

export const locationClicksOffsetPaginatedResponseDto = z
  .object({
    data: z.array(
      z
        .object({
          name: z.string().nullable(),
          clicks: z.number(),
        })
        .loose(),
    ),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  })
  .passthrough();

export const topMostAccessedUrlsResponseDto = z.array(
  z
    .object({
      shortUrl: z.string(),
      hitsCount: z.number(),
      title: z.string().nullable().optional(),
    })
    .passthrough(),
);

export const referrerDistributionResponseDto = z.array(
  z
    .object({
      referrer: z.string().nullable(),
      hitsCount: z.number(),
    })
    .passthrough(),
);

export const topMostAccessedUrlsDetailResponseDto = z.array(
  z
    .object({
      city: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      device: z.string().nullable().optional(),
      os: z.string().nullable().optional(),
      hitsCount: z.number(),
      shortUrl: z.string(),
      originalUrl: z.string(),
      title: z.string().nullable().optional(),
    })
    .passthrough(),
);
