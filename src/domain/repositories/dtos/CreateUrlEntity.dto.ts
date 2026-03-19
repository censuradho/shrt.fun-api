export interface CreateUrlEntityDto {
  shortUrl: string
  originalUrl: string
  expireAt?: Date
  description?: string
  tags?: string[]
}