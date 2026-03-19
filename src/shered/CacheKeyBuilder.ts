export class CacheKeyBuilder {
  private static readonly PREFIX = 'cache';
  private static readonly SEPARATOR = ':';

  static totalUrl (): string {
    return this.build('totalUrls');
  }

  static url (url: string): string {
    return this.build('url', url);
  }

  static urlHits (url: string): string {
    return this.build('url', url, 'hits');
  }
  
  private static build(...parts: string[]): string {
    return [this.PREFIX, ...parts].join(this.SEPARATOR);
  }
}