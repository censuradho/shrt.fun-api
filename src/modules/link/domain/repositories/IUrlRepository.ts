
import { CursorPaginationParams, CursorPaginationResult } from "@/shared/types/Pagination";
import { UrlModel } from "../models/UrlModel";
import { CreateUrlEntityDto } from "./dtos/CreateUrlEntity.dto";
import { FindManyLinksFiltersDto } from "@/modules/link/application/dtos/find-many-links-filters.dto";
import { UpdateUrlEntityDto } from "./dtos/UpdateUrlEntity";

export type UrlPaginationFilters = Pick<FindManyLinksFiltersDto,
  'createdAfter'| 
  'createdBefore'| 
  'isActive'| 
  'search' |
  'source'
>

export interface IUrlRepository {
  createAnonymous (payload: CreateUrlEntityDto): Promise<string>
  create (supabaseId: string, payload: CreateUrlEntityDto): Promise<string>
  getIdByShortUrl (url: string): Promise<string | null>
  getOriginalUrl (shortUrl: string): Promise<{ id: string; originalUrl: string, isActive: boolean } | null>
  findById (id: string, supabaseId: string): Promise<UrlModel | null>
  incrementHitsCount (id: string): Promise<void>
  delete (id: string): Promise<void>
  softDelete (id: string, supabaseId: string): Promise<string | null>
  toggleActive (id: string, supabaseId: string): Promise<{ isActive: boolean; shortUrl: string } | null>
  updateQrCodeOptions (id: string, supabaseId: string, options: Record<string, unknown>): Promise<boolean>
  countAll (): Promise<number>
  countByUserCurrentMonth (supabaseId: string): Promise<{ month: number; today: number }>
  countQrCodeByUserCurrentMonth (supabaseId: string): Promise<number>
  findManyPaginated (supabaseId: string, pagination: CursorPaginationParams, filters: UrlPaginationFilters): Promise<
    CursorPaginationResult<UrlModel>
  >
  update (id: string, supabaseId: string, payload: UpdateUrlEntityDto): Promise<void>
}