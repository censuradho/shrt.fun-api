import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { IUrlCacheService } from '@/modules/link/domain/interfaces/IUrlCacheService';
import { AppError } from '@/shared/errors/AppError';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { HTTP_STATUS_CODES } from '@/shared/constants/httpStatusCodes';

export class DeleteUrlUseCase {
  constructor(
    private readonly urlRepository: IUrlRepository,
    private readonly urlCacheService: IUrlCacheService,
  ) {}

  async execute(id: string, supabaseId: string): Promise<void> {
    const shortUrl = await this.urlRepository.softDelete(id, supabaseId);

    if (shortUrl === null) {
      throw new AppError(URL_ERRORS.URL_NOT_FOUND, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    await this.urlCacheService.deleteUrl(shortUrl);
  }
}
