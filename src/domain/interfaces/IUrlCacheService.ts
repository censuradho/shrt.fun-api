export interface IUrlCacheService {
  incrementTotalUrls(): Promise<void>
  getTotalUrls(): Promise<number | null>
  setUrl(shortUrl: string, originalUrl: string, urlId: string): Promise<void>
  getUrl(shortUrl: string): Promise<{ originalUrl: string; urlId: string } | null>
  incrementHits(shortUrl: string): Promise<void>
}
