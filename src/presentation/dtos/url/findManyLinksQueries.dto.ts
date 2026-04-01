import z from "zod";
import { cursorPaginationQueriesDto } from "../paginationQueries.dto";
import { sanitizeString } from "@/shered/sanitizeString";

export const findManyLinksFiltersDto = cursorPaginationQueriesDto.extend({
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  search: z
    .string()
    .max(255)
    .transform((value) => sanitizeString(value))
    .optional(),
  createdBefore: z.coerce.date().optional(),
  createdAfter: z.coerce.date().optional(),
}).refine((data) => {
  if (data.createdBefore && data.createdAfter) {
    return data.createdBefore > data.createdAfter;
  }
  return true;
}, {
  message: "'createdBefore' must be greater than 'createdAfter'",
  path: ['createdBefore', 'createdAfter'],
});


export type FindManyLinksFiltersDto = z.infer<typeof findManyLinksFiltersDto>;