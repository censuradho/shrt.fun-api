import { GeolocationResult, IGeolocationService } from '@/domain/interfaces/IGeolocationService';
import geoip from 'geoip-lite';

export class GeoipLiteGeolocationService implements IGeolocationService {
  lookup(ip: string): GeolocationResult {
    const geo = geoip.lookup(ip);
    return {
      country: geo?.country ?? null,
      city: geo?.city ?? null,
    };
  }
}
