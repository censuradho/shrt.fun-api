import { PaginationParams, PaginationResult } from "@/domain/interfaces/Pagination";
import { CreateUrlEntityDto } from "@/domain/repositories/dtos/CreateUrlEntity.dto";
import { IUrlRepository, UrlPaginationFilters } from "@/domain/repositories/IUrlRepository";
import { nanoid } from "nanoid";
import { PrismaClient } from "prisma/generated/client";
import { UrlModel, UrlWhereInput } from "prisma/generated/models";

export class UrlRepository implements IUrlRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async create (supabaseId: string, payload: CreateUrlEntityDto): Promise<string> {
    const data= await this.prisma.url.create({
      data: {
        id: nanoid(),
        supabaseId,
        originalUrl: payload.originalUrl,
        shortUrl: payload.shortUrl,
        title: payload.title,
        description: payload.description,
        expireAt: payload.expireAt,
        tags: payload.tags,
      },
      select: { id: true }
    })

    return data.id
  }

  async findManyPaginated(
    supabaseId: string, 
    pagination: PaginationParams, 
    filters: UrlPaginationFilters
  ): Promise<PaginationResult<UrlModel>> {
    const { cursor, limit } = pagination;
    const { isActive, search } = filters

    const where: UrlWhereInput = {
      supabaseId,
      ...(isActive !== undefined && { isActive }),
      ...(search &&  ({
        OR: [
          { originalUrl: { contains: search, mode: 'insensitive' } },
          { shortUrl: { contains: search, mode: 'insensitive' } },
        ]
      })),
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

  async getOriginalUrl(shortUrl: string): Promise<{ originalUrl: string; id: string, isActive: boolean } | null> {
    const data = await this.prisma.url.findUnique({
      where: {
        shortUrl
      },
      select: {
        originalUrl: true,
        id: true,
        isActive: true
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
        title: payload.title,
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

  async toggleActive (id: string, supabaseId: string): Promise<boolean | null> {
    const url = await this.prisma.url.findFirst({
      where: { id, user: { supabaseId } },
      select: { isActive: true },
    });

    if (!url) return null;

    const updated = await this.prisma.url.update({
      where: { id },
      data: { isActive: !url.isActive },
      select: { isActive: true },
    });

    return updated.isActive;
  }
}