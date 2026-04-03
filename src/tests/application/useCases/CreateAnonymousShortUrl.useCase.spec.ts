import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CreateAnonymousShortUrl } from '@/modules/link/application/use-cases/CreateAnonymousShortUrl.useCase';
import { IUrlCacheService } from '@/modules/link/domain/interfaces/IUrlCacheService';
import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { IShortUrlGenerateService } from '@/modules/link/domain/interfaces/IShortUrlGenerateService';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { HTTP_ERROR_CODES } from '@/shared/constants/httpStatusCodes';

const SHORT_URL = 'https://shrt.fun/abc123';
const ORIGINAL_URL = 'https://www.google.com';
const URL_ID = 'url-id';
const DTO = { url: ORIGINAL_URL, slug: undefined, title: 'Google', generateQrCode: false };

const urlRepository = mock<IUrlRepository>();
const urlCacheService = mock<IUrlCacheService>();
const shortUrlGenerateService = mock<IShortUrlGenerateService>();

beforeEach(() => {
  vi.clearAllMocks();
  urlRepository.createAnonymous.mockResolvedValue(URL_ID);
  urlCacheService.setUrl.mockResolvedValue(undefined);
  urlCacheService.incrementTotalUrls.mockResolvedValue(undefined);
  shortUrlGenerateService.generate.mockResolvedValue(SHORT_URL);
});

describe('CreateAnonymousShortUrl', () => {
  it('should create an anonymous short url and populate cache', async () => {
    const useCase = new CreateAnonymousShortUrl(urlRepository, urlCacheService, shortUrlGenerateService);
    const result = await useCase.execute(DTO);

    expect(result).toBe(SHORT_URL);
    expect(urlRepository.createAnonymous).toHaveBeenCalledWith({
      originalUrl: ORIGINAL_URL,
      shortUrl: SHORT_URL,
      title: 'Google',
      expireAt: expect.any(Date),
    });
    expect(urlCacheService.setUrl).toHaveBeenCalledWith(SHORT_URL, ORIGINAL_URL, URL_ID, true, expect.any(Number));
    expect(urlCacheService.incrementTotalUrls).toHaveBeenCalled();
  });

  it('should delete url and throw if cache fails', async () => {
    urlCacheService.setUrl.mockRejectedValue(new Error('Redis down'));

    const useCase = new CreateAnonymousShortUrl(urlRepository, urlCacheService, shortUrlGenerateService);

    await expect(useCase.execute(DTO)).rejects.toMatchObject({
      message: URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL,
      status: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
    });

    expect(urlRepository.delete).toHaveBeenCalledWith(URL_ID);
  });
});
