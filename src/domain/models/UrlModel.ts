export interface UrlModel {
  id: string
  originalUrl: string
  shortUrl: string
  hitsCount: number
  isActive: boolean
  description?: string
  tags: string[]
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}