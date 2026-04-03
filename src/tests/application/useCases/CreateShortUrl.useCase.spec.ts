import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CreateShortUrlUseCase } from '@/modules/link/application/use-cases/CreateShortUrl.useCase';
import { IUrlCacheService } from '@/modules/link/domain/interfaces/IUrlCacheService';
import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { IShortUrlGenerateService } from '@/modules/link/domain/interfaces/IShortUrlGenerateService';
import { IQRCodePort } from '@/modules/link/domain/interfaces/QRCodePort';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { HTTP_ERROR_CODES, HTTP_STATUS_CODES } from '@/shared/constants/httpStatusCodes';
import { toQrUrl } from '@/shared/utils/toQrUrl';
import { PlanName } from '@/shared/constants/Plan.enum';
import { QR_CODE_FREE_COLORS } from '@/modules/link/domain/enums/QrCodeFreeColors.enum';

const SHORT_URL = 'https://shrt.fun/abc123';
const ORIGINAL_URL = 'https://www.google.com';
const URL_ID = 'url-id';
const USER_ID = 'user-id';
const QR_CODE = 'data:image/png;base64,abc123';

const DTO = { url: ORIGINAL_URL, slug: undefined, title: 'Google', generateQrCode: false, qrOptions: undefined };
const DTO_WITH_QR = { ...DTO, generateQrCode: true, qrOptions: { dotsStyle: 'rounded' as const, dotsColor: '#000000' } };

const urlRepository = mock<IUrlRepository>();
const urlCacheService = mock<IUrlCacheService>();
const shortUrlGenerateService = mock<IShortUrlGenerateService>();
const qrCodePort = mock<IQRCodePort>();

const makeUserRepository = (overrides?: { monthlyQrCodeLimit?: number; planName?: string }): any => ({
  findById: vi.fn().mockResolvedValue({ id: USER_ID }),
  findUserBySupabaseId: vi.fn().mockResolvedValue({
    id: USER_ID,
    plan: {
      name: overrides?.planName ?? PlanName.GROWTH,
      monthlyLinkLimit: 100,
      monthlyQrCodeLimit: overrides?.monthlyQrCodeLimit ?? 10,
    },
  }),
  create: vi.fn(),
  checkIfExistsByEmail: vi.fn(),
  delete: vi.fn(),
  me: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  urlRepository.create.mockResolvedValue(URL_ID);
  urlRepository.countByUserCurrentMonth.mockResolvedValue({ month: 0, today: 0 });
  urlRepository.countQrCodeByUserCurrentMonth.mockResolvedValue(0);
  urlCacheService.setUrl.mockResolvedValue(undefined);
  urlCacheService.incrementTotalUrls.mockResolvedValue(undefined);
  shortUrlGenerateService.generate.mockResolvedValue(SHORT_URL);
  qrCodePort.generate.mockResolvedValue(QR_CODE);
});

describe('CreateShortUrlUseCase', () => {
  it('should create a short url and populate cache', async () => {
    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      shortUrlGenerateService,
      makeUserRepository(),
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
    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      shortUrlGenerateService,
      makeUserRepository(),
      qrCodePort,
    );
    const result = await useCase.execute(USER_ID, DTO_WITH_QR);

    expect(result).toEqual({ shortUrl: SHORT_URL, qrCode: QR_CODE });
    expect(qrCodePort.generate).toHaveBeenCalledWith(toQrUrl(SHORT_URL), DTO_WITH_QR.qrOptions);
    expect(urlRepository.create).toHaveBeenCalledWith(USER_ID, expect.objectContaining({
      hasQrCode: true,
      qrCodeOptions: DTO_WITH_QR.qrOptions,
    }));
  });

  it('should not create url if qrcode generation fails', async () => {
    qrCodePort.generate.mockRejectedValue(new Error('QR service down'));

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      shortUrlGenerateService,
      makeUserRepository(),
      qrCodePort,
    );

    await expect(useCase.execute(USER_ID, DTO_WITH_QR)).rejects.toThrow('QR service down');
    expect(urlRepository.create).not.toHaveBeenCalled();
  });

  it('should throw QR_CODE_BACKGROUND_COLOR_NOT_ALLOWED_ON_FREE_PLAN when free user uses a non-allowed color', async () => {
    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      shortUrlGenerateService,
      makeUserRepository({ planName: PlanName.FREE }),
      qrCodePort,
    );

    await expect(useCase.execute(USER_ID, { ...DTO_WITH_QR, qrOptions: { backgroundColor: '#dddddd' } })).rejects.toMatchObject({
      message: URL_ERRORS.QR_CODE_BACKGROUND_COLOR_NOT_ALLOWED_ON_FREE_PLAN,
      status: HTTP_STATUS_CODES.FORBIDDEN,
    });
    expect(qrCodePort.generate).not.toHaveBeenCalled();
  });

  it('should allow free user to use an allowed background color', async () => {
    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      shortUrlGenerateService,
      makeUserRepository({ planName: PlanName.FREE }),
      qrCodePort,
    );

    const result = await useCase.execute(USER_ID, { ...DTO_WITH_QR, qrOptions: { backgroundColor: QR_CODE_FREE_COLORS[0] } });

    expect(result).toEqual({ shortUrl: SHORT_URL, qrCode: QR_CODE });
    expect(qrCodePort.generate).toHaveBeenCalled();
  });

  it('should allow paid user to use any background color', async () => {
    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      shortUrlGenerateService,
      makeUserRepository({ planName: PlanName.GROWTH }),
      qrCodePort,
    );

    const result = await useCase.execute(USER_ID, { ...DTO_WITH_QR, qrOptions: { backgroundColor: '#ffffff' } });

    expect(result).toEqual({ shortUrl: SHORT_URL, qrCode: QR_CODE });
    expect(qrCodePort.generate).toHaveBeenCalled();
  });

  it('should throw MONTHLY_QR_CODE_LIMIT_REACHED when qrcode limit is reached', async () => {
    urlRepository.countQrCodeByUserCurrentMonth.mockResolvedValue(10);

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      shortUrlGenerateService,
      makeUserRepository({ monthlyQrCodeLimit: 10 }),
      qrCodePort,
    );

    await expect(useCase.execute(USER_ID, DTO_WITH_QR)).rejects.toMatchObject({
      message: URL_ERRORS.MONTHLY_QR_CODE_LIMIT_REACHED,
      status: HTTP_STATUS_CODES.FORBIDDEN,
    });
  });

  it('should delete url and throw if cache fails', async () => {
    urlCacheService.setUrl.mockRejectedValue(new Error('Redis down'));

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      shortUrlGenerateService,
      makeUserRepository(),
      qrCodePort,
    );

    await expect(useCase.execute(USER_ID, DTO)).rejects.toMatchObject({
      message: URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL,
      status: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
    });

    expect(urlRepository.delete).toHaveBeenCalledWith(URL_ID);
  });

  it('should delete url and throw if incrementTotalUrls fails', async () => {
    urlCacheService.incrementTotalUrls.mockRejectedValue(new Error('Redis down'));

    const useCase = new CreateShortUrlUseCase(
      urlRepository,
      urlCacheService,
      shortUrlGenerateService,
      makeUserRepository(),
      qrCodePort,
    );

    await expect(useCase.execute(USER_ID, DTO)).rejects.toMatchObject({
      message: URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL,
      status: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
    });

    expect(urlRepository.delete).toHaveBeenCalledWith(URL_ID);
  });
});
