import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteUrlUseCase } from '@/application/useCases/DeleteUrl.useCase';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_STATUS_CODES } from '@/shered/httpStatusCodes';

const SHORT_URL = 'https://shrt.fun/abc123';

const makeUrlRepository = (): IUrlRepository => ({
  create: vi.fn(),
  createAnonymous: vi.fn(),
  getIdByShortUrl: vi.fn(),
  getOriginalUrl: vi.fn(),
  findById: vi.fn(),
  incrementHitsCount: vi.fn(),
  delete: vi.fn(),
  softDelete: vi.fn().mockResolvedValue(SHORT_URL),
  toggleActive: vi.fn(),
  findManyPaginated: vi.fn(),
  countAll: vi.fn(),
  countByUserCurrentMonth: vi.fn(),
});

const makeUrlCacheService = (): IUrlCacheService => ({
  setUrl: vi.fn(),
  getUrl: vi.fn(),
  incrementHits: vi.fn(),
  incrementTotalUrls: vi.fn(),
  getTotalUrls: vi.fn(),
  deleteUrl: vi.fn().mockResolvedValue(undefined),
  incrementTotalClicks: vi.fn(),
});

beforeEach(() => vi.clearAllMocks());

describe('DeleteUrlUseCase', () => {
  it('should soft delete url and invalidate cache', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();
    const useCase = new DeleteUrlUseCase(urlRepository, urlCacheService);

    await useCase.execute('url-id', 'user-id');

    expect(urlRepository.softDelete).toHaveBeenCalledWith('url-id', 'user-id');
    expect(urlCacheService.deleteUrl).toHaveBeenCalledWith(SHORT_URL);
  });

  it('should throw URL_NOT_FOUND if url does not exist', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();
    vi.mocked(urlRepository.softDelete).mockResolvedValue(null);

    const useCase = new DeleteUrlUseCase(urlRepository, urlCacheService);

    await expect(useCase.execute('url-id', 'user-id')).rejects.toMatchObject({
      message: URL_ERRORS.URL_NOT_FOUND,
      status: HTTP_STATUS_CODES.NOT_FOUND,
    });
    expect(urlCacheService.deleteUrl).not.toHaveBeenCalled();
  });
});
