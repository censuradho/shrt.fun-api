import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UrlCacheService } from '@/application/services/UrlCacheService';
import { CacheGateway } from '@/domain/interfaces/CacheGateway';
import { CacheKeyBuilder } from '@/shered/CacheKeyBuilder';

const makeCacheGateway = (): CacheGateway => ({
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => vi.clearAllMocks());

describe('UrlCacheService', () => {
  describe('setUrl', () => {
    it('should set url in cache with correct key and value', async () => {
      const cache = makeCacheGateway();
      const service = new UrlCacheService(cache);

      await service.setUrl('https://shrt.fun/abc', 'https://google.com', 'url-id', true, 3600);

      expect(cache.set).toHaveBeenCalledWith(
        CacheKeyBuilder.url('https://shrt.fun/abc'),
        { originalUrl: 'https://google.com', urlId: 'url-id', isActive: true },
        3600,
      );
    });
  });

  describe('getUrl', () => {
    it('should return url from cache', async () => {
      const cache = makeCacheGateway();
      const cached = { originalUrl: 'https://google.com', urlId: 'url-id', isActive: true };
      vi.mocked(cache.get).mockResolvedValue(cached);
      const service = new UrlCacheService(cache);

      const result = await service.getUrl('https://shrt.fun/abc');

      expect(result).toEqual(cached);
      expect(cache.get).toHaveBeenCalledWith(CacheKeyBuilder.url('https://shrt.fun/abc'));
    });

    it('should return null if url not in cache', async () => {
      const cache = makeCacheGateway();
      const service = new UrlCacheService(cache);

      const result = await service.getUrl('https://shrt.fun/abc');

      expect(result).toBeNull();
    });
  });

  describe('deleteUrl', () => {
    it('should delete url from cache with correct key', async () => {
      const cache = makeCacheGateway();
      const service = new UrlCacheService(cache);

      await service.deleteUrl('https://shrt.fun/abc');

      expect(cache.delete).toHaveBeenCalledWith(CacheKeyBuilder.url('https://shrt.fun/abc'));
    });
  });

  describe('incrementTotalUrls', () => {
    it('should increment existing value in cache', async () => {
      const cache = makeCacheGateway();
      vi.mocked(cache.get).mockResolvedValue(5);
      const service = new UrlCacheService(cache);

      await service.incrementTotalUrls();

      expect(cache.set).toHaveBeenCalledWith(CacheKeyBuilder.totalUrl(), 6, expect.any(Number));
    });

    it('should set to 1 if key not in cache', async () => {
      const cache = makeCacheGateway();
      const service = new UrlCacheService(cache);

      await service.incrementTotalUrls();

      expect(cache.set).toHaveBeenCalledWith(CacheKeyBuilder.totalUrl(), 1, expect.any(Number));
    });
  });

  describe('incrementHits', () => {
    it('should increment hits for a url', async () => {
      const cache = makeCacheGateway();
      vi.mocked(cache.get).mockResolvedValue(3);
      const service = new UrlCacheService(cache);

      await service.incrementHits('https://shrt.fun/abc');

      expect(cache.set).toHaveBeenCalledWith(
        CacheKeyBuilder.urlHits('https://shrt.fun/abc'),
        4,
        expect.any(Number),
      );
    });

    it('should set hits to 1 if not in cache', async () => {
      const cache = makeCacheGateway();
      const service = new UrlCacheService(cache);

      await service.incrementHits('https://shrt.fun/abc');

      expect(cache.set).toHaveBeenCalledWith(
        CacheKeyBuilder.urlHits('https://shrt.fun/abc'),
        1,
        expect.any(Number),
      );
    });
  });

  describe('getTotalUrls', () => {
    it('should return total urls from cache', async () => {
      const cache = makeCacheGateway();
      vi.mocked(cache.get).mockResolvedValue(42);
      const service = new UrlCacheService(cache);

      const result = await service.getTotalUrls();

      expect(result).toBe(42);
      expect(cache.get).toHaveBeenCalledWith(CacheKeyBuilder.totalUrl());
    });
  });
});
