import { AppError } from '@/domain/errors/AppError';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { IDeviceService } from '@/domain/interfaces/IDeviceService';
import { IGeolocationService } from '@/domain/interfaces/IGeolocationService';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { IEnvProvider } from '@/domain/services/EnvProvider';
import { IUrlUnitOfWork } from '@/infra/repositories/url/UrlUnitOfWork';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';
import { nanoid } from 'nanoid';

export class RedirectUrlUseCase {
  constructor(
    private readonly urlCacheService: IUrlCacheService,
    private readonly urlUnitOfWork: IUrlUnitOfWork,
    private readonly geolocationService: IGeolocationService,
    private readonly deviceService: IDeviceService,
    private readonly envProvider: IEnvProvider
  ) {}

  async execute(slug: string, ip: string, userAgent: string, referrer: string | null) {
    const shortUrl = `${this.envProvider.get('REDIRECT_CLIENT_URL')}/${slug}`;
    const { country, city } = this.geolocationService.lookup(ip);
    const { device, os, browser } = this.deviceService.parse(userAgent);

    const hitPayload = { id: nanoid(), ipAddress: ip, userAgent, country, city, referrer, device, os, browser };

    const cached = await this.urlCacheService.getUrl(shortUrl);

    if (cached && !cached.isActive) {
      await this.urlCacheService.deleteUrl(shortUrl);
      throw new AppError(URL_ERRORS.URL_NOT_FOUND, { status: HTTP_ERROR_CODES.NOT_FOUND });
    }

    if (cached) {
      await this.urlUnitOfWork.run(async ({ url, hit }) => {
        await Promise.all([
          url.incrementHitsCount(cached.urlId),
          hit.incrementHitCount({ ...hitPayload, urlId: cached.urlId }),
          this.urlCacheService.incrementHits(shortUrl),
          this.urlCacheService.incrementTotalClicks()
        ])
      })
      
      return cached;
    }

    const result = await this.urlUnitOfWork.run(async ({ url, hit }) => {
      const data = await url.getOriginalUrl(shortUrl);

      if (!data) {
        throw new AppError(URL_ERRORS.URL_NOT_FOUND, { status: HTTP_ERROR_CODES.NOT_FOUND });
      }

      await Promise.all([
        url.incrementHitsCount(data.id),
        hit.incrementHitCount({ ...hitPayload, urlId: data.id }),
        this.urlCacheService.setUrl(
          shortUrl, 
          data.originalUrl, 
          data.id,
          data.isActive
        ),
        this.urlCacheService.incrementHits(shortUrl),
        this.urlCacheService.incrementTotalClicks(),
      ])

      return data;
    });


    return result;
  }
}
