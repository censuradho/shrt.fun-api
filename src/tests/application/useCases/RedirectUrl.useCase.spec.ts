import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { RedirectUrlUseCase } from '@/modules/link/application/use-cases/RedirectUrl.useCase';
import { IUrlCacheService } from '@/modules/link/domain/interfaces/IUrlCacheService';
import { IUrlUnitOfWork, IUrlUoWRepositories } from '@/modules/link/infra/repositories/UrlUnitOfWork';
import { IGeolocationService } from '@/domain/IGeolocationService';
import { IDeviceService } from '@/domain/IDeviceService';
import { AppError } from '@/shared/errors/AppError';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { HTTP_ERROR_CODES } from '@/shared/constants/httpStatusCodes';

const IP = '127.0.0.1';
const USER_AGENT = 'Mozilla/5.0';
const REFERRER = null;
const SLUG = 'xK9aB';
const DOMAIN = 'https://mv.api';
const SHORT_URL = `${DOMAIN}/${SLUG}`;
const ORIGINAL_URL = 'https://www.google.com';
const URL_ID = 'url-id';

const urlCacheService = mock<IUrlCacheService>();
const geolocationService = mock<IGeolocationService>();
const deviceService = mock<IDeviceService>();

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

const makeEnvProvider = () => ({
  get: vi.fn().mockReturnValue(DOMAIN),
});

const makeUseCase = (uow: IUrlUnitOfWork) =>
  new RedirectUrlUseCase(urlCacheService, uow, geolocationService, deviceService, makeEnvProvider());

beforeEach(() => {
  vi.clearAllMocks();
  geolocationService.lookup.mockReturnValue({ country: null, city: null });
  deviceService.parse.mockReturnValue({ device: 'desktop', os: null, browser: null });
});

describe('RedirectUrlUseCase', () => {
  describe('when URL is cached', () => {
    it('should return cached data without hitting the database', async () => {
      const uow = makeUnitOfWork();
      urlCacheService.getUrl.mockResolvedValue({ originalUrl: ORIGINAL_URL, urlId: URL_ID, isActive: true });

      const result = await makeUseCase(uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(result).toEqual(expect.objectContaining({ originalUrl: ORIGINAL_URL, urlId: URL_ID }));
      expect(urlRepositoryMock.getOriginalUrl).not.toHaveBeenCalled();
    });

    it('should call incrementHitsCount and incrementHitCount inside uow', async () => {
      const uow = makeUnitOfWork();
      urlCacheService.getUrl.mockResolvedValue({ originalUrl: ORIGINAL_URL, urlId: URL_ID, isActive: true });

      await makeUseCase(uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(urlRepositoryMock.incrementHitsCount).toHaveBeenCalledWith(URL_ID);
      expect(hitRepositoryMock.incrementHitCount).toHaveBeenCalledWith(expect.objectContaining({ urlId: URL_ID }));
    });

    it('should call incrementHits on cache service', async () => {
      const uow = makeUnitOfWork();
      urlCacheService.getUrl.mockResolvedValue({ originalUrl: ORIGINAL_URL, urlId: URL_ID, isActive: true });

      await makeUseCase(uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(urlCacheService.incrementHits).toHaveBeenCalledWith(SHORT_URL);
    });
  });

  describe('when URL is not cached', () => {
    it('should return data from database and populate cache', async () => {
      const uow = makeUnitOfWork();
      urlCacheService.getUrl.mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue({ id: URL_ID, originalUrl: ORIGINAL_URL, isActive: true });

      const result = await makeUseCase(uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(result).toEqual(expect.objectContaining({ originalUrl: ORIGINAL_URL, id: URL_ID }));
      expect(urlCacheService.setUrl).toHaveBeenCalledWith(SHORT_URL, ORIGINAL_URL, URL_ID, true);
      expect(urlCacheService.incrementHits).toHaveBeenCalledWith(SHORT_URL);
    });

    it('should call incrementHitsCount and incrementHitCount inside uow', async () => {
      const uow = makeUnitOfWork();
      urlCacheService.getUrl.mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue({ id: URL_ID, originalUrl: ORIGINAL_URL, isActive: true });

      await makeUseCase(uow).execute(SLUG, IP, USER_AGENT, REFERRER);

      expect(urlRepositoryMock.incrementHitsCount).toHaveBeenCalledWith(URL_ID);
      expect(hitRepositoryMock.incrementHitCount).toHaveBeenCalledWith(expect.objectContaining({ urlId: URL_ID }));
    });

    it('should throw AppError with URL_NOT_FOUND when url does not exist', async () => {
      const uow = makeUnitOfWork();
      urlCacheService.getUrl.mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue(null);

      await expect(
        makeUseCase(uow).execute(SLUG, IP, USER_AGENT, REFERRER)
      ).rejects.toMatchObject({
        message: URL_ERRORS.URL_NOT_FOUND,
        status: HTTP_ERROR_CODES.NOT_FOUND,
      });
    });

    it('should not call setUrl when url does not exist', async () => {
      const uow = makeUnitOfWork();
      urlCacheService.getUrl.mockResolvedValue(null);
      urlRepositoryMock.getOriginalUrl.mockResolvedValue(null);

      await expect(
        makeUseCase(uow).execute(SLUG, IP, USER_AGENT, REFERRER)
      ).rejects.toThrow(AppError);

      expect(urlCacheService.setUrl).not.toHaveBeenCalled();
    });
  });
});
