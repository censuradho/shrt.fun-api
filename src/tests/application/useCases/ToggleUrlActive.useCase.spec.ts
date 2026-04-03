import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { ToggleUrlActiveUseCase } from '@/application/useCases/ToggleUrlActive.useCase';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_STATUS_CODES } from '@/shared/httpStatusCodes';

const URL_ID = 'url-id';
const USER_ID = 'supabase-user-id';
const SHORT_URL = 'https://shrt.fun/abc123';

const urlRepository = mock<IUrlRepository>();
const urlCacheService = mock<IUrlCacheService>();

beforeEach(() => {
  vi.clearAllMocks();
  urlRepository.toggleActive.mockResolvedValue({ isActive: false, shortUrl: SHORT_URL });
  urlCacheService.deleteUrl.mockResolvedValue(undefined);
});

describe('ToggleUrlActiveUseCase', () => {
  it('should toggle url active and invalidate cache', async () => {
    const useCase = new ToggleUrlActiveUseCase(urlRepository, urlCacheService);
    const result = await useCase.execute(URL_ID, USER_ID);

    expect(result).toEqual({ isActive: false });
    expect(urlRepository.toggleActive).toHaveBeenCalledWith(URL_ID, USER_ID);
    expect(urlCacheService.deleteUrl).toHaveBeenCalledWith(SHORT_URL);
  });

  it('should throw URL_NOT_FOUND when url does not exist', async () => {
    urlRepository.toggleActive.mockResolvedValue(null);

    const useCase = new ToggleUrlActiveUseCase(urlRepository, urlCacheService);

    await expect(useCase.execute(URL_ID, USER_ID)).rejects.toMatchObject({
      message: URL_ERRORS.URL_NOT_FOUND,
      status: HTTP_STATUS_CODES.NOT_FOUND,
    });

    expect(urlCacheService.deleteUrl).not.toHaveBeenCalled();
  });
});
