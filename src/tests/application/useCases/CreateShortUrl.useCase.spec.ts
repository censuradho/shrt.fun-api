import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateShortUrlUseCase } from '@/application/useCases/CreateShortUrl.useCase';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { IShortUrlGenerateService } from '@/domain/interfaces/IShortUrlGenerateService';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';

const SHORT_URL = 'https://shrt.fun/abc123';
const ORIGINAL_URL = 'https://www.google.com';
const URL_ID = 'url-id';
const USER_ID = 'user-id';
const DTO = { url: ORIGINAL_URL, slug: undefined, title: 'Google' };

const makeUrlRepository = (): IUrlRepository => ({
  create: vi.fn().mockResolvedValue(URL_ID),
  createAnonymous: vi.fn(),
  getIdByShortUrl: vi.fn(),
  getOriginalUrl: vi.fn(),
  findById: vi.fn(),
  incrementHitsCount: vi.fn(),
  delete: vi.fn(),
  toggleActive: vi.fn(),
  findManyPaginated: vi.fn(),
  countAll: vi.fn(),
  countByUserCurrentMonth: vi.fn().mockResolvedValue({ month: 0, today: 0 }),
  softDelete: vi.fn(),
});

const makeUrlCacheService = (): IUrlCacheService => ({
  setUrl: vi.fn().mockResolvedValue(undefined),
  getUrl: vi.fn(),
  incrementHits: vi.fn(),
  incrementTotalUrls: vi.fn().mockResolvedValue(undefined),
  getTotalUrls: vi.fn(),
  deleteUrl: vi.fn(),
  incrementTotalClicks: vi.fn(),
});

const makeUserRepository = (): any => ({
  findById: vi.fn().mockResolvedValue({ id: USER_ID }),
  findUserBySupabaseId: vi.fn().mockResolvedValue({
    id: USER_ID,
    plan: { monthlyLinkLimit: 100 },
  }),
});

const makeShortUrlGenerateService = (): IShortUrlGenerateService => ({
  generate: vi.fn().mockResolvedValue(SHORT_URL),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateShortUrlUseCase', () => {
  it('should create a short url and populate cache', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();
    const generateService = makeShortUrlGenerateService();
    const userRepository = makeUserRepository();

    const useCase = new CreateShortUrlUseCase(
      urlRepository, 
      urlCacheService, 
      generateService,
      userRepository
    );
    const result = await useCase.execute(USER_ID, DTO);

    expect(result).toBe(SHORT_URL);
    expect(urlRepository.create).toHaveBeenCalledWith(USER_ID, {
      originalUrl: ORIGINAL_URL,
      shortUrl: SHORT_URL,
      title: 'Google',
    });
    expect(urlCacheService.setUrl).toHaveBeenCalledWith(SHORT_URL, ORIGINAL_URL, URL_ID, true, expect.any(Number));
    expect(urlCacheService.incrementTotalUrls).toHaveBeenCalled();
  });

  it('should delete url and throw if cache fails', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();
    const generateService = makeShortUrlGenerateService();

    vi.mocked(urlRepository.create).mockResolvedValue(URL_ID);
    vi.mocked(urlCacheService.setUrl).mockRejectedValue(new Error('Redis down'));

    const useCase = new CreateShortUrlUseCase(
      urlRepository, 
      urlCacheService, 
      generateService,
      makeUserRepository()
    );

    await expect(useCase.execute(USER_ID, DTO)).rejects.toMatchObject({
      message: URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL,
      status: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
    });

    expect(urlRepository.delete).toHaveBeenCalledWith(URL_ID);
  });

  it('should delete url and throw if incrementTotalUrls fails', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();
    const generateService = makeShortUrlGenerateService();

    vi.mocked(urlCacheService.incrementTotalUrls).mockRejectedValue(new Error('Redis down'));

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      generateService,
      makeUserRepository()
    );

    await expect(useCase.execute(USER_ID, DTO)).rejects.toMatchObject({
      message: URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL,
      status: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
    });

    expect(urlRepository.delete).toHaveBeenCalledWith(URL_ID);
  });
});
