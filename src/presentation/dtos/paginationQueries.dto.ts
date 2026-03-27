import z from "zod";

export const cursorPaginationQueriesDto = z.object({
  cursor: z
    .string()
    .max(255)
    .optional(),
  limit: z.number().int().positive().max(100).optional().default(10),
})

export type CursorPaginationQueriesDto = z.infer<typeof cursorPaginationQueriesDto>;

export const offsetPaginationQueriesDto = z.object({
  offset: z.coerce.number().int().nonnegative().optional().default(0),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type OffsetPaginationQueriesDto = z.infer<typeof offsetPaginationQueriesDto>;