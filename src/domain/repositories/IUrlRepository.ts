import { UrlModel } from "prisma/generated/models";
import { PaginationParams, PaginationResult } from "../interfaces/Pagination";
import { CreateUrlEntityDto } from "./dtos/CreateUrlEntity.dto";

export interface UrlPaginationFilters {
  isActive?: boolean
  search?: string
}

export interface IUrlRepository {
  createAnonymous (payload: CreateUrlEntityDto): Promise<string>
  create (supabaseId: string, payload: CreateUrlEntityDto): Promise<string>
  getIdByShortUrl (url: string): Promise<string | null>
  getOriginalUrl (shortUrl: string): Promise<{ id: string; originalUrl: string, isActive: boolean } | null>
  findById (id: string, supabaseId: string): Promise<UrlModel | null>
  incrementHitsCount (id: string): Promise<void>
  delete (id: string): Promise<void>
  toggleActive (id: string, supabaseId: string): Promise<boolean | null>
  findManyPaginated (supabaseId: string, pagination: PaginationParams, filters: UrlPaginationFilters): Promise<
    PaginationResult<UrlModel>
  >
}