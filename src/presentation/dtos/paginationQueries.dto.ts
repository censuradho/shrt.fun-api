import z from "zod";

export const paginationQueriesDto = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(100).optional().default(10),
})

export type PaginationQueriesDto = z.infer<typeof paginationQueriesDto>;