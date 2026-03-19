import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RedirectUrlUseCase } from '@/application/useCases/RedirectUrl.useCase';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { IUrlUnitOfWork, IUrlUoWRepositories } from '@/infra/repositories/url/UrlUnitOfWork';
import { AppError } from '@/domain/errors/AppError';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';

const IP = '127.0.0.1';
const USER_AGENT = 'Mozilla/5.0';
const SLUG = 'xK9aB';
const DOMAIN = 'https://mv.api';
const SHORT_URL = `${DOMAIN}/${SLUG}`;
const ORIGINAL_URL = 'https://www.google.com';
const URL_ID = 'url-id';

const makeUrlCacheService = (): IUrlCacheService => ({
  getUrl: vi.fn(),
  setUrl: vi.fn(),
  incrementHits: vi.fn(),
  incrementTotalUrls: vi.fn(),
  getTotalUrls: vi.fn(),
});

const urlRepositoryMock = {
  getOriginalUrl: vi.fn(),
  incrementHitsCount: vi.fn(),
  getIdByShortUrl: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

const hitRepositoryMock = {
  incrementHitCount: vi.fn(),
};

const makeUnitOfWork = (): IUrlUnitOfWork => ({
  run: vi.fn().mockImplementation((work) =>
    work({ url: urlRepositoryMock, hit: hitRepositoryMock } as unknown as IUrlUoWRepositories)
  ),
});

beforeEach(() => {
  process.env.DOMAIN_URL = DOMAIN;
  vi.clearAllMocks();
});

describe('RedirectUrlUseCase', () => {
  describe('when URL is cached', () => {
    it('should return originalUrl without hitting the database', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue({ originalUrl: ORIGINAL_URL, urlId: URL_ID });

      const result = await new RedirectUrlUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT);

      expect(result).toBe(ORIGINAL_URL);
      expect(urlRepositoryMock.getOriginalUrl).not.toHaveBeenCalled();
    });

    it('should call incrementHitsCount and incrementHitCount inside uow', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue({ originalUrl: ORIGINAL_URL, urlId: URL_ID });

      await new RedirectUrlUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT);

      expect(urlRepositoryMock.incrementHitsCount).toHaveBeenCalledWith(URL_ID);
      expect(hitRepositoryMock.incrementHitCount).toHaveBeenCalledWith(expect.objectContaining({ urlId: URL_ID }));
    });

    it('should call incrementHits on cache service', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue({ originalUrl: ORIGINAL_URL, urlId: URL_ID });

      await new RedirectUrlUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT);

      expect(cacheService.incrementHits).toHaveBeenCalledWith(SHORT_URL);
    });
  });

  describe('when URL is not cached', () => {
    it('should return originalUrl from database and populate cache', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue({ id: URL_ID, originalUrl: ORIGINAL_URL });

      const result = await new RedirectUrlUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT);

      expect(result).toBe(ORIGINAL_URL);
      expect(cacheService.setUrl).toHaveBeenCalledWith(SHORT_URL, ORIGINAL_URL, URL_ID);
      expect(cacheService.incrementHits).toHaveBeenCalledWith(SHORT_URL);
    });

    it('should call incrementHitsCount and incrementHitCount inside uow', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue({ id: URL_ID, originalUrl: ORIGINAL_URL });

      await new RedirectUrlUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT);

      expect(urlRepositoryMock.incrementHitsCount).toHaveBeenCalledWith(URL_ID);
      expect(hitRepositoryMock.incrementHitCount).toHaveBeenCalledWith(expect.objectContaining({ urlId: URL_ID }));
    });

    it('should throw AppError with URL_NOT_FOUND when url does not exist', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue(null);

      await expect(
        new RedirectUrlUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT)
      ).rejects.toMatchObject({
        message: URL_ERRORS.URL_NOT_FOUND,
        status: HTTP_ERROR_CODES.NOT_FOUND,
      });
    });

    it('should not call setUrl when url does not exist', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue(null);

      await expect(
        new RedirectUrlUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT)
      ).rejects.toThrow(AppError);

      expect(cacheService.setUrl).not.toHaveBeenCalled();
    });
  });
});
