import { OffsetPaginationParams, OffsetPaginationResult } from "@/shared/types/Pagination";
import { IHitRepository, LocationAnalyticsItem, LocationClicksItem } from "@/modules/link/domain/repositories/IHitRepository";
import { CreateHitEntityDto } from "@/modules/link/domain/repositories/dtos/CreateHitEntity.dto";
import { PrismaClient } from "@/generated/prisma/client";

export class HitRepository implements IHitRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async countAll(): Promise<number> {
    return this.prisma.hit.count();
  }

  async incrementHitCount(payload: CreateHitEntityDto): Promise<void> {
    await this.prisma.hit.create({
      data: {
        urlId: payload.urlId,
        id: payload.id,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
        country: payload.country,
        city: payload.city,
        referrer: payload.referrer,
        device: payload.device,
        os: payload.os,
        browser: payload.browser,
        source: payload.source,
      }
    })
  }

  async groupByLocation(urlId: string): Promise<LocationAnalyticsItem[]> {
    const rows = await this.prisma.hit.groupBy({
      by: ['country', 'city'],
      where: { urlId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return rows.map(row => ({
      country: row.country,
      city: row.city,
      clicks: row._count.id,
    }));
  }

  async groupByCountryByUser(supabaseId: string, pagination: OffsetPaginationParams): Promise<OffsetPaginationResult<LocationClicksItem>> {
    const where = { url: { supabaseId } };

    const [rows, total] = await Promise.all([
      this.prisma.hit.groupBy({
        by: ['country'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        skip: pagination.offset,
        take: pagination.limit,
      }),
      this.prisma.hit.groupBy({ by: ['country'], where, _count: { id: true } }).then(r => r.length),
    ]);

    return {
      data: rows.map(row => ({ name: row.country, clicks: row._count.id })),
      total,
      limit: pagination.limit,
      offset: pagination.offset,
    };
  }

  async groupByCityByUser(
    supabaseId: string, 
    pagination: OffsetPaginationParams
  ): Promise<OffsetPaginationResult<LocationClicksItem>> {
    const where = { url: { supabaseId } };

    const [rows, total] = await Promise.all([
      this.prisma.hit.groupBy({
        by: ['city'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        skip: pagination.offset,
        take: pagination.limit,
      }),
      this.prisma.hit.groupBy({ by: ['city'], where, _count: { id: true } }).then(r => r.length),
    ]);

    return {
      data: rows.map(row => ({ name: row.city, clicks: row._count.id })),
      total,
      limit: pagination.limit,
      offset: pagination.offset,
    };
  }
}