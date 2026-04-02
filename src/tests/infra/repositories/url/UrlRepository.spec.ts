import { describe, it, expect, beforeEach } from 'vitest';
import { MockContext, Context, createMockContext } from '../../../prismaContext';
import { UrlRepository } from '@/infra/repositories/url/UrlRepository.prisma';

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

describe('UrlRepository', () => {
  describe('findManyPaginated', () => {
    it('should return limited items and nextCursor when has next page', async () => {
      const repo = new UrlRepository(ctx.prisma);

      mockCtx.prisma.url.findMany.mockResolvedValue([
        { id: 'url-1', createdAt: new Date('2026-01-03') },
        { id: 'url-2', createdAt: new Date('2026-01-02') },
        { id: 'url-3', createdAt: new Date('2026-01-01') },
      ] as any);

      const result = await repo.findManyPaginated(
        'user-1',
        { limit: 2, cursor: undefined },
        {},
      );

      expect(result).toEqual({
        data: [
          { id: 'url-1', createdAt: new Date('2026-01-03') },
          { id: 'url-2', createdAt: new Date('2026-01-02') },
        ],
        nextCursor: 'url-2',
      });

      expect(mockCtx.prisma.url.findMany).toHaveBeenCalledWith({
        where: {
          supabaseId: 'user-1',
          deletedAt: null,
        },
        take: 3,
        orderBy: [
          { createdAt: 'desc' },
          { id: 'asc' },
        ],
      });
    });

    it('should return all items and null nextCursor when has no next page', async () => {
      const repo = new UrlRepository(ctx.prisma);

      mockCtx.prisma.url.findMany.mockResolvedValue([
        { id: 'url-1', createdAt: new Date('2026-01-02') },
        { id: 'url-2', createdAt: new Date('2026-01-01') },
      ] as any);

      const result = await repo.findManyPaginated(
        'user-1',
        { limit: 2, cursor: undefined },
        {},
      );

      expect(result).toEqual({
        data: [
          { id: 'url-1', createdAt: new Date('2026-01-02') },
          { id: 'url-2', createdAt: new Date('2026-01-01') },
        ],
        nextCursor: null,
      });
    });

    it('should include cursor and filters in prisma query', async () => {
      const repo = new UrlRepository(ctx.prisma);


      mockCtx.prisma.url.findMany.mockResolvedValue([] as any);

      const createdAfterAtStartOfDay = new Date('2026-01-01T00:00:00.000Z');
      const createdBeforeAtEndOfDay = new Date('2026-01-31T23:59:59.999Z');

      await repo.findManyPaginated(
        'user-1',
        { limit: 10, cursor: 'url-cursor' },
        {
          isActive: true,
          search: 'mv.api',
          createdAfter: createdAfterAtStartOfDay,
          createdBefore: createdBeforeAtEndOfDay,
        },
      );

      expect(mockCtx.prisma.url.findMany).toHaveBeenCalledWith({
        where: {
          supabaseId: 'user-1',
          deletedAt: null,
          isActive: true,
          OR: [
            { originalUrl: { contains: 'mv.api', mode: 'insensitive' } },
            { shortUrl: { contains: 'mv.api', mode: 'insensitive' } },
          ],
          createdAt: { gte: createdAfterAtStartOfDay, lte: createdBeforeAtEndOfDay },
        },
        take: 11,
        skip: 1,
        cursor: { id: 'url-cursor' },
        orderBy: [
          { createdAt: 'desc' },
          { id: 'asc' },
        ],
      });
    });
  });

  describe('create', () => {
    it('should create a url and return its id', async () => {
      const repo = new UrlRepository(ctx.prisma);
      const payload = {
        originalUrl: 'https://www.google.com',
        shortUrl: 'https://mv.api/xK9aB',
        expireAt: new Date(),
      };

      mockCtx.prisma.url.create.mockResolvedValue({ id: 'generated-id' } as any);

      const id = await repo.create('asdasd', payload);

      expect(id).toBe('generated-id');
      expect(mockCtx.prisma.url.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          originalUrl: payload.originalUrl,
          shortUrl: payload.shortUrl,
          expireAt: payload.expireAt,
        }),
        select: { id: true },
      });
    });
  });

  describe('getOriginalUrl', () => {
    it('should return originalUrl and id when found', async () => {
      const repo = new UrlRepository(ctx.prisma);
      const shortUrl = 'https://mv.api/xK9aB';
      const expected = { id: 'url-id', originalUrl: 'https://www.google.com' };

      mockCtx.prisma.url.findFirst.mockResolvedValue(expected as any);

      const result = await repo.getOriginalUrl(shortUrl);

      expect(result).toEqual(expected);
      expect(mockCtx.prisma.url.findFirst).toHaveBeenCalledWith({
        where: { shortUrl, deletedAt: null },
        select: { originalUrl: true, id: true, isActive: true },
      });
    });

    it('should return null when not found', async () => {
      const repo = new UrlRepository(ctx.prisma);

      mockCtx.prisma.url.findUnique.mockResolvedValue(null);

      const result = await repo.getOriginalUrl('https://mv.api/notfound');

      expect(result).toBeNull();
      expect(mockCtx.prisma.url.findFirst).toHaveBeenCalledWith({
        where: { 
          shortUrl: 'https://mv.api/notfound',
          deletedAt: null
        },
        select: {         
          originalUrl: true,
          id: true,
          isActive: true 
        },
      });
    });
  });

  describe('getIdByShortUrl', () => {
    it('should return the id when found', async () => {
      const repo = new UrlRepository(ctx.prisma);

      mockCtx.prisma.url.findUnique.mockResolvedValue({ id: 'url-id' } as any);

      const id = await repo.getIdByShortUrl('https://mv.api/xK9aB');

      expect(id).toBe('url-id');
      expect(mockCtx.prisma.url.findUnique).toHaveBeenCalledWith({
        where: { shortUrl: 'https://mv.api/xK9aB' },
        select: { id: true },
      });
    });

    it('should return null when not found', async () => {
      const repo = new UrlRepository(ctx.prisma);

      mockCtx.prisma.url.findUnique.mockResolvedValue(null);

      const id = await repo.getIdByShortUrl('https://mv.api/notfound');

      expect(id).toBeNull();
      expect(mockCtx.prisma.url.findUnique).toHaveBeenCalledWith({
        where: { shortUrl: 'https://mv.api/notfound' },
        select: { id: true },
      });
    });
  });

  describe('incrementHitsCount', () => {
    it('should call update with increment 1', async () => {
      const repo = new UrlRepository(ctx.prisma);

      mockCtx.prisma.url.update.mockResolvedValue({} as any);

      await repo.incrementHitsCount('url-id');

      expect(mockCtx.prisma.url.update).toHaveBeenCalledWith({
        where: { id: 'url-id' },
        data: { hitsCount: { increment: 1 } },
      });
    });
  });

  describe('delete', () => {
    it('should call delete with the given id', async () => {
      const repo = new UrlRepository(ctx.prisma);

      mockCtx.prisma.url.delete.mockResolvedValue({} as any);

      await repo.delete('url-id');

      expect(mockCtx.prisma.url.delete).toHaveBeenCalledWith({
        where: { id: 'url-id' },
      });
    });
  });

  describe('updateQrCodeOptions', () => {
    it('should update qrCodeOptions and return true when url exists and has qrcode', async () => {
      const repo = new UrlRepository(ctx.prisma);
      const options = { dotsStyle: 'rounded', dotsColor: '#ff0000' };

      mockCtx.prisma.url.findFirst.mockResolvedValue({ id: 'url-id' } as any);
      mockCtx.prisma.url.update.mockResolvedValue({} as any);

      const result = await repo.updateQrCodeOptions('url-id', 'user-id', options);

      expect(result).toBe(true);
      expect(mockCtx.prisma.url.findFirst).toHaveBeenCalledWith({
        where: { id: 'url-id', supabaseId: 'user-id', deletedAt: null },
        select: { id: true },
      });
      expect(mockCtx.prisma.url.update).toHaveBeenCalledWith({
        where: { id: 'url-id' },
        data: { qrCodeOptions: options, hasQrCode: true },
      });
    });

    it('should return false and not update when url is not found', async () => {
      const repo = new UrlRepository(ctx.prisma);

      mockCtx.prisma.url.findFirst.mockResolvedValue(null);

      const result = await repo.updateQrCodeOptions('url-id', 'user-id', {});

      expect(result).toBe(false);
      expect(mockCtx.prisma.url.update).not.toHaveBeenCalled();
    });
  });
});
