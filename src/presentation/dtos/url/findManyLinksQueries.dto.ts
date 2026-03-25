import z from "zod";
import { paginationQueriesDto } from "../paginationQueries.dto";

export const findManyLinksFiltersDto = paginationQueriesDto.extend({
  isActive: z.boolean().optional(),
})

export type FindManyLinksFiltersDto = z.infer<typeof findManyLinksFiltersDto>;