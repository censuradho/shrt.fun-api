export interface CursorPaginationParams {
  cursor?: string
  limit: number
}

export interface CursorPaginationResult<T> {
  data: T[]
  nextCursor: string | null
}

export interface OffsetPaginationParams {
  limit: number
  offset: number
}

export interface OffsetPaginationResult<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}
