import { IHitRepository, LocationAnalyticsItem } from "@/domain/repositories/IHitRepository";
import { CreateHitEntityDto } from "@/domain/repositories/dtos/CreateHitEntity.dto";
import { PrismaClient } from "@/generated/prisma/client";

export class HitRepository implements IHitRepository {
  constructor (private readonly prisma: PrismaClient) {}

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
}