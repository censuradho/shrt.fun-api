import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { UrlCacheService } from '@/application/services/UrlCacheService';
import { CacheGateway } from '@/domain/interfaces/CacheGateway';
import { CacheKeyBuilder } from '@/shered/CacheKeyBuilder';

const cacheGateway = mock<CacheGateway>();

beforeEach(() => {
  vi.clearAllMocks();
  cacheGateway.get.mockResolvedValue(null);
  cacheGateway.set.mockResolvedValue(undefined);
  cacheGateway.delete.mockResolvedValue(undefined);
});

describe('UrlCacheService', () => {
  describe('setUrl', () => {
    it('should set url in cache with correct key and value', async () => {
      const service = new UrlCacheService(cacheGateway);

      await service.setUrl('https://shrt.fun/abc', 'https://google.com', 'url-id', true, 3600);

      expect(cacheGateway.set).toHaveBeenCalledWith(
        CacheKeyBuilder.url('https://shrt.fun/abc'),
        { originalUrl: 'https://google.com', urlId: 'url-id', isActive: true },
        3600,
      );
    });
  });

  describe('getUrl', () => {
    it('should return url from cache', async () => {
      const cached = { originalUrl: 'https://google.com', urlId: 'url-id', isActive: true };
      cacheGateway.get.mockResolvedValue(cached);
      const service = new UrlCacheService(cacheGateway);

      const result = await service.getUrl('https://shrt.fun/abc');

      expect(result).toEqual(cached);
      expect(cacheGateway.get).toHaveBeenCalledWith(CacheKeyBuilder.url('https://shrt.fun/abc'));
    });

    it('should return null if url not in cache', async () => {
      const service = new UrlCacheService(cacheGateway);

      const result = await service.getUrl('https://shrt.fun/abc');

      expect(result).toBeNull();
    });
  });

  describe('deleteUrl', () => {
    it('should delete url from cache with correct key', async () => {
      const service = new UrlCacheService(cacheGateway);

      await service.deleteUrl('https://shrt.fun/abc');

      expect(cacheGateway.delete).toHaveBeenCalledWith(CacheKeyBuilder.url('https://shrt.fun/abc'));
    });
  });

  describe('incrementTotalUrls', () => {
    it('should increment existing value in cache', async () => {
      cacheGateway.get.mockResolvedValue(5);
      const service = new UrlCacheService(cacheGateway);

      await service.incrementTotalUrls();

      expect(cacheGateway.set).toHaveBeenCalledWith(CacheKeyBuilder.totalUrl(), 6, expect.any(Number));
    });

    it('should set to 1 if key not in cache', async () => {
      const service = new UrlCacheService(cacheGateway);

      await service.incrementTotalUrls();

      expect(cacheGateway.set).toHaveBeenCalledWith(CacheKeyBuilder.totalUrl(), 1, expect.any(Number));
    });
  });

  describe('incrementHits', () => {
    it('should increment hits for a url', async () => {
      cacheGateway.get.mockResolvedValue(3);
      const service = new UrlCacheService(cacheGateway);

      await service.incrementHits('https://shrt.fun/abc');

      expect(cacheGateway.set).toHaveBeenCalledWith(
        CacheKeyBuilder.urlHits('https://shrt.fun/abc'),
        4,
        expect.any(Number),
      );
    });

    it('should set hits to 1 if not in cache', async () => {
      const service = new UrlCacheService(cacheGateway);

      await service.incrementHits('https://shrt.fun/abc');

      expect(cacheGateway.set).toHaveBeenCalledWith(
        CacheKeyBuilder.urlHits('https://shrt.fun/abc'),
        1,
        expect.any(Number),
      );
    });
  });

  describe('getTotalUrls', () => {
    it('should return total urls from cache', async () => {
      cacheGateway.get.mockResolvedValue(42);
      const service = new UrlCacheService(cacheGateway);

      const result = await service.getTotalUrls();

      expect(result).toBe(42);
      expect(cacheGateway.get).toHaveBeenCalledWith(CacheKeyBuilder.totalUrl());
    });
  });
});
