import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { AppError } from '@/domain/errors/AppError';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_STATUS_CODES } from '@/shered/httpStatusCodes';

export class ToggleUrlActiveUseCase {
  constructor(private readonly urlRepository: IUrlRepository) {}

  async execute(id: string, supabaseId: string): Promise<{ isActive: boolean }> {
    const isActive = await this.urlRepository.toggleActive(id, supabaseId);

    if (isActive === null) {
      throw new AppError(URL_ERRORS.URL_NOT_FOUND, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    return { isActive };
  }
}
