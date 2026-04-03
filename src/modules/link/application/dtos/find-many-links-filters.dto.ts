import { HitSourceEnum } from '@/modules/link/domain/enums/Hit.enum';
import { sanitizeString } from '@/shared/helpers/sanitizeString';
import { cursorPaginationQueriesDto } from '@/shared/types/pagination-queries.dto';
import { endOfDay, startOfDay } from 'date-fns';
import z from 'zod';

export const findManyLinksFiltersDto = cursorPaginationQueriesDto
  .extend({
    isActive: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    search: z
      .string()
      .max(255)
      .transform((value) => sanitizeString(value))
      .optional(),
    createdBefore: z.coerce.date().transform((date) => endOfDay(date)).optional(),
    createdAfter: z.coerce.date().transform((date) => startOfDay(date)).optional(),
    source: z.enum([HitSourceEnum.QR, HitSourceEnum.URL]).optional(),
  })
  .refine((data) => {
    if (data.createdBefore && data.createdAfter) {
      return data.createdBefore > data.createdAfter;
    }
    return true;
  }, {
    message: "'createdBefore' must be greater than 'createdAfter'",
    path: ['createdBefore', 'createdAfter'],
  })
  .refine((data) => {
    const { createdAfter } = data;
    return !createdAfter || createdAfter <= new Date();
  }, {
    message: "'createdAfter' cannot be in the future",
    path: ['createdAfter'],
  });

export type FindManyLinksFiltersDto = z.infer<typeof findManyLinksFiltersDto>;
