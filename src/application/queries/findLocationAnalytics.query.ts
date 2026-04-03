import { AppError } from '@/domain/errors/AppError';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { IHitRepository } from '@/domain/repositories/IHitRepository';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { HTTP_ERROR_CODES } from '@/shared/httpStatusCodes';

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
