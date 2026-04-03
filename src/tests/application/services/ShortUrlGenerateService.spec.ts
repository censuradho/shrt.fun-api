import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShortUrlGenerateService } from '@/modules/link/domain/services/ShortUrlGenerateService';
import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { IEnvProvider } from '@/shared/types/interfaces/EnvProvider';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { HTTP_ERROR_CODES } from '@/shared/constants/httpStatusCodes';

const DOMAIN = 'https://shrt.fun';

const makeUrlRepository = (): IUrlRepository => ({
  create: vi.fn(),
  createAnonymous: vi.fn(),
  getIdByShortUrl: vi.fn().mockResolvedValue(null),
  getOriginalUrl: vi.fn(),
  findById: vi.fn(),
  incrementHitsCount: vi.fn(),
  delete: vi.fn(),
  softDelete: vi.fn(),
  toggleActive: vi.fn(),
  updateQrCodeOptions: vi.fn(),
  countAll: vi.fn(),
  countByUserCurrentMonth: vi.fn(),
  countQrCodeByUserCurrentMonth: vi.fn(),
  findManyPaginated: vi.fn(),
});

const makeEnvProvider = (): IEnvProvider => ({
  get: vi.fn().mockReturnValue(DOMAIN),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ShortUrlGenerateService', () => {
  it('should generate a short url with auto hash when no slug is provided', async () => {
    const urlRepository = makeUrlRepository();
    const envProvider = makeEnvProvider();

    const service = new ShortUrlGenerateService(urlRepository, envProvider);
    const result = await service.generate();

    expect(result).toMatch(new RegExp(`^${DOMAIN}/`));
    expect(urlRepository.getIdByShortUrl).toHaveBeenCalled();
  });

  it('should generate a short url from slug when provided', async () => {
    const urlRepository = makeUrlRepository();
    const envProvider = makeEnvProvider();

    const service = new ShortUrlGenerateService(urlRepository, envProvider);
    const result = await service.generate('my-custom-slug');

    expect(result).toBe(`${DOMAIN}/my-custom-slug`);
  });

  it('should throw SHORT_URL_ALREADY_EXISTS when slug is already taken', async () => {
    const urlRepository = makeUrlRepository();
    const envProvider = makeEnvProvider();

    vi.mocked(urlRepository.getIdByShortUrl).mockResolvedValue('existing-id');

    const service = new ShortUrlGenerateService(urlRepository, envProvider);

    await expect(service.generate('taken-slug')).rejects.toMatchObject({
      message: URL_ERRORS.SHORT_URL_ALREADY_EXISTS,
      status: HTTP_ERROR_CODES.CONFLICT,
    });
  });
});
