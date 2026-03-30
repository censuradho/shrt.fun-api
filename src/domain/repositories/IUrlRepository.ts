import { UrlModel } from "@/generated/prisma/models";
import { CursorPaginationParams, CursorPaginationResult } from "../interfaces/Pagination";
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
  softDelete (id: string, supabaseId: string): Promise<string | null>
  toggleActive (id: string, supabaseId: string): Promise<{ isActive: boolean; shortUrl: string } | null>
  findManyPaginated (supabaseId: string, pagination: CursorPaginationParams, filters: UrlPaginationFilters): Promise<
    CursorPaginationResult<UrlModel>
  >
}