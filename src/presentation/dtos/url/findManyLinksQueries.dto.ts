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
})

export type FindManyLinksFiltersDto = z.infer<typeof findManyLinksFiltersDto>;