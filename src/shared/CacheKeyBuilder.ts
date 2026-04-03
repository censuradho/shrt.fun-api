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

  static totalClicks (): string {
    return this.build('totalClicks');
  }
  
  static user(userId: string): string {
    return this.build('user', userId)
  }

  private static build(...parts: string[]): string {
    return [this.PREFIX, ...parts].join(this.SEPARATOR);
  }
}