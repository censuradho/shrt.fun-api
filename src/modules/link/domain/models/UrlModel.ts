import { JsonValue } from "@prisma/client/runtime/client"

export interface UrlModel {
  id: string
  originalUrl: string
  shortUrl: string
  title?: string | null
  hitsCount: number
  isActive: boolean
  description?: string | null
  tags: string[]
  expireAt?: Date | null
  createdAt: Date
  updatedAt: Date
  hasQrCode: boolean
  qrCodeOptions?: JsonValue | null
}