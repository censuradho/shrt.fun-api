import { describe, it, expect, vi } from 'vitest';
import { GeoipLiteGeolocationService } from '@/infra/geolocation/GeoipLiteGeolocationService';

vi.mock('geoip-lite', () => ({
  default: {
    lookup: vi.fn(),
  },
}));

import geoip from 'geoip-lite';

describe('GeoipLiteGeolocationService', () => {
  it('should return country and city from geo lookup', () => {
    vi.mocked(geoip.lookup).mockReturnValue({ country: 'BR', city: 'São Paulo' } as any);
    const service = new GeoipLiteGeolocationService();

    const result = service.lookup('200.200.200.200');

    expect(result).toEqual({ country: 'BR', city: 'São Paulo' });
    expect(geoip.lookup).toHaveBeenCalledWith('200.200.200.200');
  });

  it('should return nulls when ip is not found', () => {
    vi.mocked(geoip.lookup).mockReturnValue(null);
    const service = new GeoipLiteGeolocationService();

    const result = service.lookup('127.0.0.1');

    expect(result).toEqual({ country: null, city: null });
  });
});
