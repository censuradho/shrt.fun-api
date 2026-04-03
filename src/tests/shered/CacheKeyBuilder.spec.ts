import { describe, it, expect } from 'vitest';
import { CacheKeyBuilder } from '@/shared/kernel/CacheKeyBuilder';

describe('CacheKeyBuilder', () => {
  it('should build totalUrl key', () => {
    expect(CacheKeyBuilder.totalUrl()).toBe('cache:totalUrls');
  });

  it('should build url key', () => {
    expect(CacheKeyBuilder.url('https://shrt.fun/abc')).toBe('cache:url:https://shrt.fun/abc');
  });

  it('should build urlHits key', () => {
    expect(CacheKeyBuilder.urlHits('https://shrt.fun/abc')).toBe('cache:url:https://shrt.fun/abc:hits');
  });

  it('should build totalClicks key', () => {
    expect(CacheKeyBuilder.totalClicks()).toBe('cache:totalClicks');
  });
});
