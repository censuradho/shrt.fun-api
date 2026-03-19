import { CacheGateway } from '@/domain/interfaces/CacheGateway';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { CacheKeyBuilder } from '@/shered/CacheKeyBuilder';

const URL_TTL_SECONDS = 3600; // 1 hour — standard for URL shortener caches

export class UrlCacheService implements IUrlCacheService {
  constructor(private readonly cache: CacheGateway) {}

  async incrementTotalUrls(): Promise<void> {
    const cacheKey = CacheKeyBuilder.totalUrl();
    const totalUrls = await this.cache.get<number>(cacheKey);
    if (totalUrls !== null) {
      await this.cache.set(cacheKey, totalUrls + 1);
    } else {
      await this.cache.set(cacheKey, 1);
    }
  }

  async getTotalUrls(): Promise<number | null> {
    const cacheKey = CacheKeyBuilder.totalUrl();
    return await this.cache.get<number>(cacheKey);
  }

  async setUrl(shortUrl: string, originalUrl: string, urlId: string): Promise<void> {
    const cacheKey = CacheKeyBuilder.url(shortUrl);
    await this.cache.set(cacheKey, { originalUrl, urlId }, URL_TTL_SECONDS);
  }

  async getUrl(shortUrl: string): Promise<{ originalUrl: string; urlId: string } | null> {
    const cacheKey = CacheKeyBuilder.url(shortUrl);
    return await this.cache.get<{ originalUrl: string; urlId: string }>(cacheKey);
  }

  async incrementHits(shortUrl: string): Promise<void> {
    const cacheKey = CacheKeyBuilder.urlHits(shortUrl);
    const hits = await this.cache.get<number>(cacheKey);
    await this.cache.set(cacheKey, hits !== null ? hits + 1 : 1);
  }
}
