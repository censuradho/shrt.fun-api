import z from "zod";
import { paginationQueriesDto } from "../paginationQueries.dto";
import { sanitizeString } from "@/shered/sanitizeString";

export const findManyLinksFiltersDto = paginationQueriesDto.extend({
  isActive: z.boolean().optional(),
  search: z
    .string()
    .max(255)
    .transform((value) => sanitizeString(value))
    .optional(),
})

export type FindManyLinksFiltersDto = z.infer<typeof findManyLinksFiltersDto>;