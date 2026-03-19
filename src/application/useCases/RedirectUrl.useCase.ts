import { AppError } from '@/domain/errors/AppError';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';

export class RedirectUrlUseCase {
  constructor(
    private readonly urlRepository: IUrlRepository,
    private readonly urlCacheService: IUrlCacheService
  ) {}

  async execute(slug: string): Promise<string> {
    const shortUrl = `${process.env.DOMAIN_URL}/${slug}`;

    const cached = await this.urlCacheService.getUrl(shortUrl);

    if (cached) {
      await this.urlCacheService.incrementHits(shortUrl);
      return cached;
    }

    const originalUrl = await this.urlRepository.getOriginalUrl(shortUrl);
    if (!originalUrl) {
      throw new AppError(URL_ERRORS.URL_NOT_FOUND, {
        status: HTTP_ERROR_CODES.NOT_FOUND
      });
    }

    await this.urlCacheService.setUrl(shortUrl, originalUrl);
    await this.urlCacheService.incrementHits(shortUrl);

    return originalUrl;
  }
}
