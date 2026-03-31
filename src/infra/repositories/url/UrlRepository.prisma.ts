import { CursorPaginationParams, CursorPaginationResult } from "@/domain/interfaces/Pagination";
import { CreateUrlEntityDto } from "@/domain/repositories/dtos/CreateUrlEntity.dto";
import { IUrlRepository, UrlPaginationFilters } from "@/domain/repositories/IUrlRepository";
import { nanoid } from "nanoid";
import { PrismaClient } from "@/generated/prisma/client";
import { UrlModel, UrlWhereInput } from "@/generated/prisma/models";

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
    pagination: CursorPaginationParams, 
    filters: UrlPaginationFilters
  ): Promise<CursorPaginationResult<UrlModel>> {
    const { cursor, limit } = pagination;
    const { isActive, search } = filters

    const where: UrlWhereInput = {
      supabaseId,
      deletedAt: null,
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
    const data = await this.prisma.url.findFirst({
      where: {
        shortUrl,
        deletedAt: null,
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
        isAnonymous: true,
      },
      select: { id: true }
    })

    return data.id
  }

  async findById (id: string, supabaseId: string): Promise<UrlModel | null> {
    const data = await this.prisma.url.findFirst({
      where: { id, supabaseId, deletedAt: null },
    });

    return data || null;
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

  async countAll (): Promise<number> {
    return this.prisma.url.count({ where: { deletedAt: null } });
  }

  async countByUserCurrentMonth (supabaseId: string): Promise<{ month: number; today: number }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [month, today] = await Promise.all([
      this.prisma.url.count({
        where: { supabaseId, deletedAt: null, createdAt: { gte: monthStart, lt: monthEnd } },
      }),
      this.prisma.url.count({
        where: { supabaseId, deletedAt: null, createdAt: { gte: dayStart, lt: dayEnd } },
      }),
    ]);

    return { month, today };
  }

  async incrementHitsCount (id: string): Promise<void> {
    await this.prisma.url.update({
      where: { id },
      data: { hitsCount: { increment: 1 } }
    })
  }

  async delete (id: string): Promise<void> {
    await this.prisma.url.delete({
      where: { id }
    })
  }

  async softDelete (id: string, supabaseId: string): Promise<string | null> {
    const url = await this.prisma.url.findFirst({
      where: { id, supabaseId, deletedAt: null },
      select: { shortUrl: true },
    });

    if (!url) return null;

    await this.prisma.url.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return url.shortUrl;
  }

  async toggleActive (id: string, supabaseId: string): Promise<{ isActive: boolean; shortUrl: string } | null> {
    const url = await this.prisma.url.findFirst({
      where: { id, user: { supabaseId } },
      select: { isActive: true, shortUrl: true },
    });

    if (!url) return null;

    const updated = await this.prisma.url.update({
      where: { id },
      data: { isActive: !url.isActive },
      select: { isActive: true, shortUrl: true },
    });

    return updated;
  }
}