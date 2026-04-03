import { CacheGateway } from '@/infra/domain/CacheGateway';
import { IUrlCacheService } from '@/modules/link/domain/interfaces/IUrlCacheService';
import { CacheKeyBuilder } from '@/shared/kernel/CacheKeyBuilder';

const URL_TTL_SECONDS = 3600; // 1 hour — standard for URL shortener caches

export class UrlCacheService implements IUrlCacheService {
  constructor(private readonly cache: CacheGateway) {}

  async incrementTotalUrls(ttl: number = URL_TTL_SECONDS): Promise<void> {
    const cacheKey = CacheKeyBuilder.totalUrl();
    const totalUrls = await this.cache.get<number>(cacheKey);
    if (totalUrls !== null) {
      await this.cache.set(cacheKey, totalUrls + 1, ttl);
    } else {
      await this.cache.set(cacheKey, 1, ttl);
    }
  }

  async getTotalUrls(): Promise<number | null> {
    const cacheKey = CacheKeyBuilder.totalUrl();
    return await this.cache.get<number>(cacheKey);
  }

  async setUrl(shortUrl: string, originalUrl: string, urlId: string, isActive: boolean, ttl: number = URL_TTL_SECONDS): Promise<void> {
    const cacheKey = CacheKeyBuilder.url(shortUrl);
    await this.cache.set(cacheKey, { originalUrl, urlId, isActive }, ttl);
  }

  async getUrl(shortUrl: string): Promise<{ originalUrl: string; urlId: string; isActive: boolean } | null> {
    const cacheKey = CacheKeyBuilder.url(shortUrl);
    return await this.cache.get<{ originalUrl: string; urlId: string; isActive: boolean }>(cacheKey);
  }

  async deleteUrl(shortUrl: string): Promise<void> {
    const cacheKey = CacheKeyBuilder.url(shortUrl);
    await this.cache.delete(cacheKey);
  }

  async incrementTotalClicks(ttl: number = URL_TTL_SECONDS): Promise<void> {
    const cacheKey = CacheKeyBuilder.totalClicks();
    const total = await this.cache.get<number>(cacheKey);
    await this.cache.set(cacheKey, total !== null ? total + 1 : 1, ttl);
  }

  async incrementHits(shortUrl: string, ttl: number = URL_TTL_SECONDS): Promise<void> {
    const cacheKey = CacheKeyBuilder.urlHits(shortUrl);
    const hits = await this.cache.get<number>(cacheKey);
    await this.cache.set(cacheKey, hits !== null ? hits + 1 : 1, ttl);
  }
}
