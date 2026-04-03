import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { TopMostAccessedUrlModel } from "@/modules/analytics/domain/models/TopMostAccessedUrl.model";
import { IAnalyticsRepository, TopMostAccessedUrlsOptions } from "@/modules/analytics/domain/repositories/IAnalyticsRepository";
import { TopMostAccessedUrlByLocationDeviceAndOSModel } from "@/modules/analytics/domain/models/TopMostAccessedUrlByLocationDeviceAndOS.model";
import { ReferrerDistributionModel } from "@/modules/analytics/domain/models/ReferrerDistribution.model";

export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private prisma: PrismaClient) {}

  async topMostAccessedUrlsByLocationDeviceAndOS(
    userId: string, 
    options?: TopMostAccessedUrlsOptions
  ): Promise<TopMostAccessedUrlByLocationDeviceAndOSModel[]> {
    const {
      isActive,
      limit,
    } = options || {};

    const where: Prisma.UrlWhereInput = { 
      supabaseId: userId,
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      hitsCount: { gt: 0 },
    }
    const result = await this.prisma.url.findMany({
      where,
      take: limit,
      orderBy: { hitsCount: "desc" },
    })

    const data = await this.prisma.hit.groupBy({
      by: ['city', 'country', 'device', 'os', 'urlId'],
      where: {
        urlId: { in: result.map(r => r.id) },
      },
      take: limit,
      orderBy: {
        _count: { urlId: 'desc' }
      },
      _count: {
        urlId: true,
      },        
    })

    return data.map(d => {
      const url = result.find(r => r.id === d.urlId)

      return ({
        city: d.city,
        country: d.country,
        device: d.device,
        os: d.os,
        hitsCount: d._count.urlId,
        shortUrl: url?.shortUrl || '',
        title: url?.title || null,
        originalUrl: url?.originalUrl || '',
      })
    })
  }

  async referrerDistribution(userId: string, limit = 9): Promise<ReferrerDistributionModel[]> {
    const urlIds = await this.prisma.url.findMany({
      where: { 
        supabaseId: userId, 
        deletedAt: null 
      },
      select: { id: true },
    });

    const rows = await this.prisma.hit.groupBy({
      by: ['referrer'],
      where: { urlId: { in: urlIds.map(u => u.id) } },
      _count: { urlId: true },
      orderBy: { _count: { referrer: 'desc' } },
    });

    const top = rows.slice(0, limit);
    const rest = rows.slice(limit);

    const result: ReferrerDistributionModel[] = top.map(r => ({
      referrer: r.referrer,
      hitsCount: r._count.urlId,
    }));

    if (rest.length > 0) {
      const otherCount = rest.reduce((acc, r) => acc + r._count.urlId, 0);
      result.push({ referrer: 'Other', hitsCount: otherCount });
    }

    return result;
  }

  async topMostAccessedUrls(userId: string, options?: TopMostAccessedUrlsOptions): Promise<TopMostAccessedUrlModel[]> {
    const { limit, isActive } = options || {};

    const where: Prisma.UrlWhereInput = { 
      supabaseId: userId,
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      hitsCount: { gt: 0 },
    }

    return this.prisma.url.findMany({
      where,
      orderBy: { hitsCount: "desc" },
      take: limit,
      select: {
        shortUrl: true,
        originalUrl: true,
        hitsCount: true,
        title: true,
      },
    });
  }
}
