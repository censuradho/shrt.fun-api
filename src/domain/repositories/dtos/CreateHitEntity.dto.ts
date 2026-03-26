export interface CreateHitEntityDto {
  urlId: string
  userAgent: string
  ipAddress: string
  id: string
  country?: string | null
  city?: string | null
}