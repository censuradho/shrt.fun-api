import { PaginationParams, PaginationResult } from "@/domain/interfaces/Pagination";
import { CreateUrlEntityDto } from "@/domain/repositories/dtos/CreateUrlEntity.dto";
import { IUrlRepository, UrlPaginationFilters } from "@/domain/repositories/IUrlRepository";
import { nanoid } from "nanoid";
import { PrismaClient } from "prisma/generated/client";
import { UrlModel, UrlWhereInput } from "prisma/generated/models";

export class UrlRepository implements IUrlRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async findManyPaginated(
    userId: string, 
    pagination: PaginationParams, 
    filters: UrlPaginationFilters
  ): Promise<PaginationResult<UrlModel>> {
    const { cursor, limit } = pagination;
    const { isActive } = filters

    const where: UrlWhereInput = {
      userId,
      ...(isActive !== undefined && { isActive })
    }

    const data = await this.prisma.url.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: [
        { createdAt: "desc" },
        { id: "asc" },
      ]
    });

    const hasNextPage = data.length > limit;
    const items = hasNextPage ? data.slice(0, -1) : data;

    return {
      data: items,
      nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
    };
  }

  async getOriginalUrl(shortUrl: string): Promise<{ originalUrl: string; id: string } | null> {
    const data = await this.prisma.url.findUnique({
      where: {
        shortUrl
      },
      select: {
        originalUrl: true,
        id: true
      }
    })

    return data || null;
  }

  async createAnonymous (payload: CreateUrlEntityDto): Promise<string> { 
    const data= await this.prisma.url.create({
      data: {
        id: nanoid(),
        originalUrl: payload.originalUrl,
        shortUrl: payload.shortUrl,
        description: payload.description,
        expireAt: payload.expireAt,
        tags: payload.tags,
      },
      select: { id: true }
    })

    return data.id
  }

  async getIdByShortUrl (url: string): Promise<string | null> {
    const data = await this.prisma.url.findUnique({
      where: {
        shortUrl: url
      },
      select: {
        id: true
      }
    })

    return data?.id || null
  }

  async incrementHitsCount (id: string): Promise<void> {
    await this.prisma.url.update({
      where: { id },
      data: { hitsCount: { increment: 1 } }
    })
  }

  async delete (id: string): Promise<void> {
    await this.prisma.url.delete({
      where: {
        id
      }
    })
  }
}