import { describe, it, expect, beforeEach } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { ShortUrlGenerateService } from '@/modules/link/domain/services/ShortUrlGenerateService';
import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { IEnvProvider } from '@/domain/EnvProvider';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { HTTP_ERROR_CODES } from '@/shared/constants/httpStatusCodes';

const DOMAIN = 'https://shrt.fun';

let urlRepository: ReturnType<typeof mockDeep<IUrlRepository>>;
let envProvider: ReturnType<typeof mockDeep<IEnvProvider>>;

beforeEach(() => {
  urlRepository = mockDeep<IUrlRepository>();
  envProvider = mockDeep<IEnvProvider>();
  urlRepository.getIdByShortUrl.mockResolvedValue(null);
  envProvider.get.mockReturnValue(DOMAIN);
});

describe('ShortUrlGenerateService', () => {
  it('should generate a short url with auto hash when no slug is provided', async () => {
    const service = new ShortUrlGenerateService(urlRepository, envProvider);
    const result = await service.generate();

    expect(result).toMatch(new RegExp(`^${DOMAIN}/`));
    expect(urlRepository.getIdByShortUrl).toHaveBeenCalled();
  });

  it('should generate a short url from slug when provided', async () => {
    const service = new ShortUrlGenerateService(urlRepository, envProvider);
    const result = await service.generate('my-custom-slug');

    expect(result).toBe(`${DOMAIN}/my-custom-slug`);
  });

  it('should throw SHORT_URL_ALREADY_EXISTS when slug is already taken', async () => {
    urlRepository.getIdByShortUrl.mockResolvedValue('existing-id');

    const service = new ShortUrlGenerateService(urlRepository, envProvider);

    await expect(service.generate('taken-slug')).rejects.toMatchObject({
      message: URL_ERRORS.SHORT_URL_ALREADY_EXISTS,
      status: HTTP_ERROR_CODES.CONFLICT,
    });
  });
});
