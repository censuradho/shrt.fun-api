import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { TopMostAccessedUrlModel } from "@/domain/models/TopMostAccessedUrl.model";
import { IAnalyticsRepository, TopMostAccessedUrlsOptions } from "@/domain/repositories/IAnalyticsRepository";
import { TopMostAccessedUrlByLocationDeviceAndOSModel } from "@/domain/models/TopMostAccessedUrlByLocationDeviceAndOS.model";

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
      orderBy: {
        _count: { urlId: 'desc' }
      },
      _count: {
        urlId: true,
      },        
    })

    return data.map(d => ({
      city: d.city,
      country: d.country,
      device: d.device,
      os: d.os,
      hitsCount: d._count.urlId,
      shortUrl: result.find(r => r.id === d.urlId)?.shortUrl || '',
    }))
  }

  async topMostAccessedUrls(userId: string, options?: TopMostAccessedUrlsOptions): Promise<TopMostAccessedUrlModel[]> {
    const { limit, isActive } = options || {};

    const where: Prisma.UrlWhereInput = { 
      supabaseId: userId,
      ...(isActive !== undefined && { isActive }),
      hitsCount: { gt: 0 },
    }

    console.log(
      await this.topMostAccessedUrlsByLocationDeviceAndOS(userId)
    )

    return this.prisma.url.findMany({
      where,
      orderBy: { hitsCount: "desc" },
      take: limit,
      select: {
        shortUrl: true,
        hitsCount: true,
      },
    });
  }
}
