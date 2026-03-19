export interface IUrlCacheService {
  incrementTotalUrls(): Promise<void>
  getTotalUrls(): Promise<number | null>
  setUrl(shortUrl: string, originalUrl: string): Promise<void>
  getUrl(shortUrl: string): Promise<string | null>
  incrementHits(shortUrl: string): Promise<void>
}
