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

      mockCtx.prisma.url.findUnique.mockResolvedValue(expected as any);

      const result = await repo.getOriginalUrl(shortUrl);

      expect(result).toEqual(expected);
      expect(mockCtx.prisma.url.findUnique).toHaveBeenCalledWith({
        where: { shortUrl },
        select: { originalUrl: true, id: true, isActive: true },
      });
    });

    it('should return null when not found', async () => {
      const repo = new UrlRepository(ctx.prisma);

      mockCtx.prisma.url.findUnique.mockResolvedValue(null);

      const result = await repo.getOriginalUrl('https://mv.api/notfound');

      expect(result).toBeNull();
      expect(mockCtx.prisma.url.findUnique).toHaveBeenCalledWith({
        where: { shortUrl: 'https://mv.api/notfound' },
        select: { originalUrl: true, id: true, isActive: true },
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
});
