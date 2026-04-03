import { HitSourceEnum } from "@/modules/link/domain/enums/Hit.enum"

export type HitSource = typeof HitSourceEnum[keyof typeof HitSourceEnum]

export interface CreateHitEntityDto {
  urlId: string
  userAgent: string
  ipAddress: string
  id: string
  source: HitSource
  country?: string | null
  city?: string | null
  referrer?: string | null
  device?: string | null
  os?: string | null
  browser?: string | null
}