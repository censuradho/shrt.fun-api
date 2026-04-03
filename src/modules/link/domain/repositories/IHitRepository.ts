import { OffsetPaginationParams, OffsetPaginationResult } from "@/shared/types/Pagination";
import { CreateHitEntityDto } from "./dtos/CreateHitEntity.dto";

export interface LocationAnalyticsItem {
  country: string | null
  city: string | null
  clicks: number
}

export interface LocationClicksItem {
  name: string | null
  clicks: number
}

export interface IHitRepository {
  incrementHitCount(payload: CreateHitEntityDto): Promise<void>;
  groupByLocation(urlId: string): Promise<LocationAnalyticsItem[]>;
  groupByCountryByUser(supabaseId: string, pagination: OffsetPaginationParams): Promise<OffsetPaginationResult<LocationClicksItem>>;
  groupByCityByUser(supabaseId: string, pagination: OffsetPaginationParams): Promise<OffsetPaginationResult<LocationClicksItem>>;
  countAll(): Promise<number>;
}