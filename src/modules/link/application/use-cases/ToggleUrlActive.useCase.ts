import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { IUrlCacheService } from '@/modules/link/domain/interfaces/IUrlCacheService';
import { AppError } from '@/shared/errors/AppError';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { HTTP_STATUS_CODES } from '@/shared/constants/httpStatusCodes';

export class ToggleUrlActiveUseCase {
  constructor(
    private readonly urlRepository: IUrlRepository,
    private readonly urlCacheService: IUrlCacheService,
  ) {}

  async execute(id: string, supabaseId: string): Promise<{ isActive: boolean }> {
    const result = await this.urlRepository.toggleActive(id, supabaseId);

    if (result === null) {
      throw new AppError(URL_ERRORS.URL_NOT_FOUND, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    await this.urlCacheService.deleteUrl(result.shortUrl);

    return { isActive: result.isActive };
  }
}
