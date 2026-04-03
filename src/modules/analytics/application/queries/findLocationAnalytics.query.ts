import { AppError } from '@/shared/errors/AppError';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { IHitRepository } from '@/modules/link/domain/repositories/IHitRepository';
import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { HTTP_ERROR_CODES } from '@/shared/constants/httpStatusCodes';

export class FindLocationAnalyticsQuery {
  constructor(
    private readonly urlRepository: IUrlRepository,
    private readonly hitRepository: IHitRepository
  ) {}

  async execute(urlId: string, supabaseId: string) {
    const url = await this.urlRepository.findById(urlId, supabaseId);

    if (!url) {
      throw new AppError(URL_ERRORS.URL_NOT_FOUND, { status: HTTP_ERROR_CODES.NOT_FOUND });
    }

    return this.hitRepository.groupByLocation(urlId);
  }
}
