import { AppError } from '@/domain/errors/AppError';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';

export class FindUrlByIdQuery {
  constructor(private readonly urlRepository: IUrlRepository) {}

  async execute(id: string, supabaseId: string) {
    const url = await this.urlRepository.findById(id, supabaseId);

    if (!url) {
      throw new AppError(URL_ERRORS.URL_NOT_FOUND, { status: HTTP_ERROR_CODES.NOT_FOUND });
    }

    return url;
  }
}
