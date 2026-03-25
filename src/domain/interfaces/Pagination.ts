export interface PaginationParams {
  cursor?: string
  limit: number
}

export interface PaginationResult<T> {
  data: T[]
  nextCursor: string | null
}