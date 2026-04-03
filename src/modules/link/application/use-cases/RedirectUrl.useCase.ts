import { HitSourceEnum } from '@/modules/link/domain/enums/Hit.enum';
import { AppError } from '@/shared/errors/AppError';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { IDeviceService } from '@/infra/domain/IDeviceService';
import { IGeolocationService } from '@/infra/domain/IGeolocationService';
import { IUrlCacheService } from '@/modules/link/domain/interfaces/IUrlCacheService';
import { HitSource } from '@/modules/link/domain/repositories/dtos/CreateHitEntity.dto';
import { IEnvProvider } from '@/infra/domain/EnvProvider';
import { IUrlUnitOfWork } from '@/modules/link/infra/repositories/UrlUnitOfWork';
import { HTTP_ERROR_CODES } from '@/shared/constants/httpStatusCodes';
import { nanoid } from 'nanoid';

export class RedirectUrlUseCase {
  constructor(
    private readonly urlCacheService: IUrlCacheService,
    private readonly urlUnitOfWork: IUrlUnitOfWork,
    private readonly geolocationService: IGeolocationService,
    private readonly deviceService: IDeviceService,
    private readonly envProvider: IEnvProvider
  ) {}

  async execute(slug: string, ip: string, userAgent: string, referrer: string | null, source: HitSource = HitSourceEnum.URL) {
    const shortUrl = `${this.envProvider.get('REDIRECT_CLIENT_URL')}/${slug}`;
    const { country, city } = this.geolocationService.lookup(ip);
    const { device, os, browser } = this.deviceService.parse(userAgent);

    const hitPayload = { id: nanoid(), ipAddress: ip, userAgent, country, city, referrer, device, os, browser, source };

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
