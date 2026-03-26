import { CreateHitEntityDto } from "./dtos/CreateHitEntity.dto";

export interface LocationAnalyticsItem {
  country: string | null
  city: string | null
  clicks: number
}

export interface IHitRepository {
  incrementHitCount(payload: CreateHitEntityDto): Promise<void>;
  groupByLocation(urlId: string): Promise<LocationAnalyticsItem[]>;
}