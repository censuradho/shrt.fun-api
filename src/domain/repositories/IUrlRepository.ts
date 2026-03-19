import { CreateUrlEntityDto } from "./dtos/CreateUrlEntity.dto";

export interface IUrlRepository {
  create (payload: CreateUrlEntityDto): Promise<string>

  getIdByShortUrl (url: string): Promise<string | null>

  getOriginalUrl (shortUrl: string): Promise<{ id: string; originalUrl: string } | null>

  incrementHitsCount (id: string): Promise<void>

  delete (id: string): Promise<void>
}