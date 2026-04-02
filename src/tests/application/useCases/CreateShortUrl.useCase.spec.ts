import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateShortUrlUseCase } from '@/application/useCases/CreateShortUrl.useCase';
import { IUrlCacheService } from '@/domain/interfaces/IUrlCacheService';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { IShortUrlGenerateService } from '@/domain/interfaces/IShortUrlGenerateService';
import { IQRCodePort } from '@/domain/interfaces/QRCodePort';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_ERROR_CODES, HTTP_STATUS_CODES } from '@/shered/httpStatusCodes';

const SHORT_URL = 'https://shrt.fun/abc123';
const ORIGINAL_URL = 'https://www.google.com';
const URL_ID = 'url-id';
const USER_ID = 'user-id';
const QR_CODE = 'data:image/png;base64,abc123';

const DTO = { url: ORIGINAL_URL, slug: undefined, title: 'Google', generateQrCode: false, qrOptions: undefined };
const DTO_WITH_QR = { ...DTO, generateQrCode: true, qrOptions: { dotsStyle: 'rounded' as const, dotsColor: '#000000' } };

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
  countQrCodeByUserCurrentMonth: vi.fn().mockResolvedValue(0),
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

const makeUserRepository = (overrides?: { monthlyQrCodeLimit?: number }): any => ({
  findById: vi.fn().mockResolvedValue({ id: USER_ID }),
  findUserBySupabaseId: vi.fn().mockResolvedValue({
    id: USER_ID,
    plan: { monthlyLinkLimit: 100, monthlyQrCodeLimit: overrides?.monthlyQrCodeLimit ?? 10 },
  }),
  create: vi.fn(),
  checkIfExistsByEmail: vi.fn(),
  delete: vi.fn(),
  me: vi.fn(),
});

const makeShortUrlGenerateService = (): IShortUrlGenerateService => ({
  generate: vi.fn().mockResolvedValue(SHORT_URL),
});

const makeQrCodePort = (): IQRCodePort => ({
  generate: vi.fn().mockResolvedValue(QR_CODE),
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
    const qrCodePort = makeQrCodePort();

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      generateService,
      userRepository,
      qrCodePort,
    );
    const result = await useCase.execute(USER_ID, DTO);

    expect(result).toEqual({ shortUrl: SHORT_URL, qrCode: undefined });
    expect(urlRepository.create).toHaveBeenCalledWith(USER_ID, {
      originalUrl: ORIGINAL_URL,
      shortUrl: SHORT_URL,
      title: 'Google',
      hasQrCode: false,
    });
    expect(urlCacheService.setUrl).toHaveBeenCalledWith(SHORT_URL, ORIGINAL_URL, URL_ID, true, expect.any(Number));
    expect(urlCacheService.incrementTotalUrls).toHaveBeenCalled();
    expect(qrCodePort.generate).not.toHaveBeenCalled();
  });

  it('should generate qrcode when generateQrCode is true', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();
    const generateService = makeShortUrlGenerateService();
    const qrCodePort = makeQrCodePort();

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      generateService,
      makeUserRepository(),
      qrCodePort,
    );
    const result = await useCase.execute(USER_ID, DTO_WITH_QR);

    expect(result).toEqual({ shortUrl: SHORT_URL, qrCode: QR_CODE });
    expect(qrCodePort.generate).toHaveBeenCalledWith(SHORT_URL, DTO_WITH_QR.qrOptions);
    expect(urlRepository.create).toHaveBeenCalledWith(USER_ID, expect.objectContaining({ hasQrCode: true }));
  });

  it('should not create url if qrcode generation fails', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();
    const generateService = makeShortUrlGenerateService();
    const qrCodePort = makeQrCodePort();

    vi.mocked(qrCodePort.generate).mockRejectedValue(new Error('QR service down'));

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      generateService,
      makeUserRepository(),
      qrCodePort,
    );

    await expect(useCase.execute(USER_ID, DTO_WITH_QR)).rejects.toThrow('QR service down');
    expect(urlRepository.create).not.toHaveBeenCalled();
  });

  it('should throw MONTHLY_QR_CODE_LIMIT_REACHED when qrcode limit is reached', async () => {
    const urlRepository = makeUrlRepository();
    vi.mocked(urlRepository.countQrCodeByUserCurrentMonth).mockResolvedValue(10);

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      makeUrlCacheService(),
      makeShortUrlGenerateService(),
      makeUserRepository({ monthlyQrCodeLimit: 10 }),
      makeQrCodePort(),
    );

    await expect(useCase.execute(USER_ID, DTO_WITH_QR)).rejects.toMatchObject({
      message: URL_ERRORS.MONTHLY_QR_CODE_LIMIT_REACHED,
      status: HTTP_STATUS_CODES.FORBIDDEN,
    });
  });

  it('should delete url and throw if cache fails', async () => {
    const urlRepository = makeUrlRepository();
    const urlCacheService = makeUrlCacheService();
    const generateService = makeShortUrlGenerateService();

    vi.mocked(urlCacheService.setUrl).mockRejectedValue(new Error('Redis down'));

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      generateService,
      makeUserRepository(),
      makeQrCodePort(),
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
      makeUserRepository(),
      makeQrCodePort(),
    );

    await expect(useCase.execute(USER_ID, DTO)).rejects.toMatchObject({
      message: URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL,
      status: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
    });

    expect(urlRepository.delete).toHaveBeenCalledWith(URL_ID);
  });
});
