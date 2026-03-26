export interface CreateHitEntityDto {
  urlId: string
  userAgent: string
  ipAddress: string
  id: string
  country?: string | null
  city?: string | null
  referrer?: string | null
  device?: string | null
  os?: string | null
  browser?: string | null
}