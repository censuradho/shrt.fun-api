import { AnalyticsRepository } from "@/infra/repositories/analytics/AnalyticsRepository.prisma";
import { Context, createMockContext, MockContext } from "@/tests/prismaContext";
import { beforeEach, describe, expect, it } from "vitest";

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

describe('AnalyticsRepository', () => {
  describe('referrerDistribution', () => {
    it('should return top referrers grouped', async () => {
      const repo = new AnalyticsRepository(ctx.prisma);
      mockCtx.prisma.url.findMany.mockResolvedValue([{ id: 'url-1' }, { id: 'url-2' }] as any);
      ;(mockCtx.prisma.hit.groupBy as any).mockResolvedValue([
        { referrer: 'google.com', _count: { urlId: 50 } },
        { referrer: 'twitter.com', _count: { urlId: 20 } },
      ]);

      const result = await repo.referrerDistribution('user-id', 9);

      expect(result).toEqual([
        { referrer: 'google.com', hitsCount: 50 },
        { referrer: 'twitter.com', hitsCount: 20 },
      ]);
    });

    it('should group remaining referrers into Other when exceeding limit', async () => {
      const repo = new AnalyticsRepository(ctx.prisma);
      mockCtx.prisma.url.findMany.mockResolvedValue([{ id: 'url-1' }] as any);
      ;(mockCtx.prisma.hit.groupBy as any).mockResolvedValue([
        { referrer: 'a.com', _count: { urlId: 10 } },
        { referrer: 'b.com', _count: { urlId: 8 } },
        { referrer: 'c.com', _count: { urlId: 5 } },
      ]);

      const result = await repo.referrerDistribution('user-id', 2);

      expect(result).toEqual([
        { referrer: 'a.com', hitsCount: 10 },
        { referrer: 'b.com', hitsCount: 8 },
        { referrer: 'Other', hitsCount: 5 },
      ]);
    });
  });

  describe('topMostAccessedUrls', () => {
    it('should return top urls ordered by hits', async () => {
      const repo = new AnalyticsRepository(ctx.prisma);
      const urls = [
        { shortUrl: 'https://shrt.fun/a', hitsCount: 100, title: 'A' },
        { shortUrl: 'https://shrt.fun/b', hitsCount: 50, title: 'B' },
      ];
      mockCtx.prisma.url.findMany.mockResolvedValue(urls as any);

      const result = await repo.topMostAccessedUrls('user-id', { limit: 9 });

      expect(result).toEqual(urls);
      expect(mockCtx.prisma.url.findMany).toHaveBeenCalledWith({
        where: { supabaseId: 'user-id', deletedAt: null, hitsCount: { gt: 0 } },
        orderBy: { hitsCount: 'desc' },
        take: 9,
        select: { shortUrl: true, hitsCount: true, title: true },
      });
    });
  });

  describe('topMostAccessedUrlsByLocationDeviceAndOS', () => {
    it ('should return top accessed urls grouped by location, device and os', async () => {
      const repo = new AnalyticsRepository(ctx.prisma);
      const userId = 'user-id';

      mockCtx.prisma.url.findMany.mockResolvedValue([
        { id: 'url-1', shortUrl: 'short-1', title: 'Title 1', originalUrl: 'http://example.com/1' },
        { id: 'url-2', shortUrl: 'short-2', title: 'Title 2', originalUrl: 'http://example.com/2' },
      ] as any);

      (mockCtx.prisma.hit.groupBy as any).mockResolvedValue([
        { city: 'City A', country: 'Country A', device: 'Mobile', os: 'iOS', urlId: 'url-1', _count: { urlId: 10 } },
        { city: 'City B', country: 'Country B', device: 'Desktop', os: 'Windows', urlId: 'url-2', _count: { urlId: 5 } },
      ] as any);

      const result = await repo.topMostAccessedUrlsByLocationDeviceAndOS(userId, {
        limit: 9
      });

      expect(mockCtx.prisma.url.findMany).toHaveBeenCalledWith({
        where: {
          supabaseId: userId, 
          deletedAt: null,
          hitsCount: { gt: 0 },
        },
        take: 9,
        orderBy: { hitsCount: "desc" },
      })

      expect(mockCtx.prisma.hit.groupBy).toHaveBeenCalledWith({
        by: ['city', 'country', 'device', 'os', 'urlId'],
        where: {
          urlId: { in: ['url-1', 'url-2'] },
        },
        take: 9,
        orderBy: {
          _count: { urlId: 'desc' }
        },
        _count: {
          urlId: true,
        },        
      })

      expect(result).toEqual([
        {
          city: 'City A',
          country: 'Country A',
          device: 'Mobile',
          os: 'iOS',
          hitsCount: 10,
          shortUrl: 'short-1',
          title: 'Title 1',
          originalUrl: 'http://example.com/1',
        },
        {
          city: 'City B',
          country: 'Country B',
          device: 'Desktop',
          os: 'Windows',
          hitsCount: 5,
          shortUrl: 'short-2',
          title: 'Title 2',
          originalUrl: 'http://example.com/2',
        },
      ])
    })
  })
})