import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RedirectUrlUseCase } from '@/application/useCases/RedirectUrl.useCase';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { IUrlUnitOfWork, IUrlUoWRepositories } from '@/infra/repositories/url/UrlUnitOfWork';
import { IGeolocationService } from '@/domain/interfaces/IGeolocationService';
import { IDeviceService } from '@/domain/interfaces/IDeviceService';
import { AppError } from '@/domain/errors/AppError';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';

const IP = '127.0.0.1';
const USER_AGENT = 'Mozilla/5.0';
const REFERRER = null;
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

const makeGeolocationService = (): IGeolocationService => ({
  lookup: vi.fn().mockReturnValue({ country: null, city: null }),
});

const makeDeviceService = (): IDeviceService => ({
  parse: vi.fn().mockReturnValue({ device: 'desktop', os: null, browser: null }),
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

const makeUseCase = (
  cacheService: IUrlCacheService,
  uow: IUrlUnitOfWork,
  geo = makeGeolocationService(),
  device = makeDeviceService()
) => new RedirectUrlUseCase(cacheService, uow, geo, device);

beforeEach(() => {
  process.env.DOMAIN_URL = DOMAIN;
  vi.clearAllMocks();
});

describe('RedirectUrlUseCase', () => {
  describe('when URL is cached', () => {
    it('should return cached data without hitting the database', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue({ originalUrl: ORIGINAL_URL, urlId: URL_ID, isActive: true });

      const result = await makeUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(result).toEqual(expect.objectContaining({ originalUrl: ORIGINAL_URL, urlId: URL_ID }));
      expect(urlRepositoryMock.getOriginalUrl).not.toHaveBeenCalled();
    });

    it('should call incrementHitsCount and incrementHitCount inside uow', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue({ originalUrl: ORIGINAL_URL, urlId: URL_ID, isActive: true });

      await makeUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(urlRepositoryMock.incrementHitsCount).toHaveBeenCalledWith(URL_ID);
      expect(hitRepositoryMock.incrementHitCount).toHaveBeenCalledWith(expect.objectContaining({ urlId: URL_ID }));
    });

    it('should call incrementHits on cache service', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue({ originalUrl: ORIGINAL_URL, urlId: URL_ID, isActive: true });

      await makeUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(cacheService.incrementHits).toHaveBeenCalledWith(SHORT_URL);
    });
  });

  describe('when URL is not cached', () => {
    it('should return data from database and populate cache', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue({ id: URL_ID, originalUrl: ORIGINAL_URL, isActive: true });

      const result = await makeUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(result).toEqual(expect.objectContaining({ originalUrl: ORIGINAL_URL, id: URL_ID }));
      expect(cacheService.setUrl).toHaveBeenCalledWith(SHORT_URL, ORIGINAL_URL, URL_ID, true);
      expect(cacheService.incrementHits).toHaveBeenCalledWith(SHORT_URL);
    });

    it('should call incrementHitsCount and incrementHitCount inside uow', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue({ id: URL_ID, originalUrl: ORIGINAL_URL, isActive: true });

      await makeUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(urlRepositoryMock.incrementHitsCount).toHaveBeenCalledWith(URL_ID);
      expect(hitRepositoryMock.incrementHitCount).toHaveBeenCalledWith(expect.objectContaining({ urlId: URL_ID }));
    });

    it('should throw AppError with URL_NOT_FOUND when url does not exist', async () => {
      const cacheService = makeUrlCacheService();
      const uow = makeUnitOfWork();

      vi.mocked(cacheService.getUrl).mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue(null);

      await expect(
        makeUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT, REFERRER)
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
        makeUseCase(cacheService, uow).execute(SLUG, IP, USER_AGENT, REFERRER)
      ).rejects.toThrow(AppError);

      expect(cacheService.setUrl).not.toHaveBeenCalled();
    });
  });
});
