import { AppError } from '@/domain/errors/AppError';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { IUrlUnitOfWork } from '@/infra/repositories/url/UrlUnitOfWork';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';
import { nanoid } from 'nanoid';

export class RedirectUrlUseCase {
  constructor(
    private readonly urlCacheService: IUrlCacheService,
    private readonly urlUnitOfWork: IUrlUnitOfWork
  ) {}

  async execute(slug: string, ip: string, userAgent: string): Promise<string> {
    const shortUrl = `${process.env.DOMAIN_URL}/${slug}`;
    const hitPayload = { id: nanoid(), ipAddress: ip, userAgent };

    const cached = await this.urlCacheService.getUrl(shortUrl);

    if (cached) {
      await this.urlUnitOfWork.run(async ({ url, hit }) => {
        await Promise.all([
          url.incrementHitsCount(cached.urlId),
          hit.incrementHitCount({ ...hitPayload, urlId: cached.urlId }),
          this.urlCacheService.incrementHits(shortUrl)
        ])
      })
      
      return cached.originalUrl;
    }

    const result = await this.urlUnitOfWork.run(async ({ url, hit }) => {
      const data = await url.getOriginalUrl(shortUrl);

      if (!data) {
        throw new AppError(URL_ERRORS.URL_NOT_FOUND, { status: HTTP_ERROR_CODES.NOT_FOUND });
      }

      await Promise.all([
        url.incrementHitsCount(data.id),
        hit.incrementHitCount({ ...hitPayload, urlId: data.id }),
        this.urlCacheService.setUrl(shortUrl, data.originalUrl, data.id),
        this.urlCacheService.incrementHits(shortUrl),
      ])

      return data;
    });


    return result.originalUrl;
  }
}
