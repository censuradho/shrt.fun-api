import { UrlModel } from "prisma/generated/models";
import { PaginationParams, PaginationResult } from "../interfaces/Pagination";
import { CreateUrlEntityDto } from "./dtos/CreateUrlEntity.dto";

export interface UrlPaginationFilters {
  isActive?: boolean
}

export interface IUrlRepository {
  create (payload: CreateUrlEntityDto): Promise<string>
  getIdByShortUrl (url: string): Promise<string | null>
  getOriginalUrl (shortUrl: string): Promise<{ id: string; originalUrl: string } | null>
  incrementHitsCount (id: string): Promise<void>
  delete (id: string): Promise<void>
  findManyPaginated (userId: string, pagination: PaginationParams, filters: UrlPaginationFilters): Promise<
    PaginationResult<UrlModel>
  >
}