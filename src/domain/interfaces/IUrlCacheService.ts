export interface IUrlCacheService {
  incrementTotalUrls(ttl?: number): Promise<void>
  getTotalUrls(): Promise<number | null>
  setUrl(shortUrl: string, originalUrl: string, urlId: string, ttl?: number): Promise<void>
  getUrl(shortUrl: string): Promise<{ originalUrl: string; urlId: string } | null>
  incrementHits(shortUrl: string, ttl?: number): Promise<void>
}
