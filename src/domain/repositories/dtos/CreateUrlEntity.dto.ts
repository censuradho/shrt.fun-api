export interface CreateUrlEntityDto {
  shortUrl: string
  originalUrl: string
  title?: string
  expireAt?: Date
  description?: string
  tags?: string[]
  hasQrCode?: boolean
}