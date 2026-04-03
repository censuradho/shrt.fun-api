import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { DeleteUrlUseCase } from '@/modules/link/application/use-cases/DeleteUrl.useCase';
import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { IUrlCacheService } from '@/modules/link/domain/interfaces/IUrlCacheService';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { HTTP_STATUS_CODES } from '@/shared/constants/httpStatusCodes';

const SHORT_URL = 'https://shrt.fun/abc123';

const urlRepository = mock<IUrlRepository>();
const urlCacheService = mock<IUrlCacheService>();

beforeEach(() => {
  vi.clearAllMocks();
  urlRepository.softDelete.mockResolvedValue(SHORT_URL);
  urlCacheService.deleteUrl.mockResolvedValue(undefined);
});

describe('DeleteUrlUseCase', () => {
  it('should soft delete url and invalidate cache', async () => {
    const useCase = new DeleteUrlUseCase(urlRepository, urlCacheService);

    await useCase.execute('url-id', 'user-id');

    expect(urlRepository.softDelete).toHaveBeenCalledWith('url-id', 'user-id');
    expect(urlCacheService.deleteUrl).toHaveBeenCalledWith(SHORT_URL);
  });

  it('should throw URL_NOT_FOUND if url does not exist', async () => {
    urlRepository.softDelete.mockResolvedValue(null);

    const useCase = new DeleteUrlUseCase(urlRepository, urlCacheService);

    await expect(useCase.execute('url-id', 'user-id')).rejects.toMatchObject({
      message: URL_ERRORS.URL_NOT_FOUND,
      status: HTTP_STATUS_CODES.NOT_FOUND,
    });
    expect(urlCacheService.deleteUrl).not.toHaveBeenCalled();
  });
});
