import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { TopMostAccessedUrlModel } from "@/domain/models/TopMostAccessedUrl.model";
import { IAnalyticsRepository, TopMostAccessedUrlsOptions } from "@/domain/repositories/IAnalyticsRepository";

export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private prisma: PrismaClient) {}

  async topMostAccessedUrls(userId: string, options?: TopMostAccessedUrlsOptions): Promise<TopMostAccessedUrlModel[]> {
    const { limit, isActive } = options || {};

    const where: Prisma.UrlWhereInput = { 
      supabaseId: userId,
      ...(isActive !== undefined && { isActive }),
      hitsCount: { gt: 0 },
    }

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
