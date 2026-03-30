import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToggleUrlActiveUseCase } from '@/application/useCases/ToggleUrlActive.useCase';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_STATUS_CODES } from '@/shered/httpStatusCodes';

const URL_ID = 'url-id';
const USER_ID = 'supabase-user-id';
const SHORT_URL = 'https://shrt.fun/abc123';

const makeUrlRepository = (): IUrlRepository => ({
  create: vi.fn(),
  createAnonymous: vi.fn(),
  getIdByShortUrl: vi.fn(),
  getOriginalUrl: vi.fn(),
  findById: vi.fn(),
  incrementHitsCount: vi.fn(),
  delete: vi.fn(),
  toggleActive: vi.fn().mockResolvedValue({ isActive: false, shortUrl: SHORT_URL }),
  findManyPaginated: vi.fn(),
});

const makeUrlCacheService = (): IUrlCacheService => ({
  setUrl: vi.fn(),
  getUrl: vi.fn(),
  incrementHits: vi.fn(),
  incrementTotalUrls: vi.fn(),
  getTotalUrls: vi.fn(),
  deleteUrl: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ToggleUrlActiveUseCase', () => {
  it('should toggle url active and invalidate cache', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();

    const useCase = new ToggleUrlActiveUseCase(urlRepository, urlCacheService);
    const result = await useCase.execute(URL_ID, USER_ID);

    expect(result).toEqual({ isActive: false });
    expect(urlRepository.toggleActive).toHaveBeenCalledWith(URL_ID, USER_ID);
    expect(urlCacheService.deleteUrl).toHaveBeenCalledWith(SHORT_URL);
  });

  it('should throw URL_NOT_FOUND when url does not exist', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();

    vi.mocked(urlRepository.toggleActive).mockResolvedValue(null);

    const useCase = new ToggleUrlActiveUseCase(urlRepository, urlCacheService);

    await expect(useCase.execute(URL_ID, USER_ID)).rejects.toMatchObject({
      message: URL_ERRORS.URL_NOT_FOUND,
      status: HTTP_STATUS_CODES.NOT_FOUND,
    });

    expect(urlCacheService.deleteUrl).not.toHaveBeenCalled();
  });
});
