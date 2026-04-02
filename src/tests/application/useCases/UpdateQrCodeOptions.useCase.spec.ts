import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { UpdateQrCodeOptionsUseCase } from '@/application/useCases/UpdateQrCodeOptions.useCase';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { IUserService, CachedUser } from '@/domain/interfaces/IUserService';
import { PlanName } from '@/domain/enums/Plan.enum';
import { QR_CODE_FREE_COLORS } from '@/domain/enums/QrCodeFreeColors.enum';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';
import { AUTHENTICATION_ERROR_MESSAGES } from '@/domain/errors/authentication.errors';

const urlRepository = mock<IUrlRepository>();
const userService = mock<IUserService>();

const makeUser = (planName: string): CachedUser => ({
  id: 'user-1',
  email: 'user@example.com',
  plan: { name: planName, monthlyLinkLimit: 100, monthlyQrCodeLimit: 50 },
})

beforeEach(() => {
  vi.clearAllMocks();
  urlRepository.updateQrCodeOptions.mockResolvedValue(true);
});

describe('UpdateQrCodeOptionsUseCase', () => {
  it('should update qrcode options for a paid user with any color', async () => {
    userService.getUser.mockResolvedValue(makeUser(PlanName.GROWTH));
    const useCase = new UpdateQrCodeOptionsUseCase(urlRepository, userService);

    await useCase.execute('url-1', 'user-1', { backgroundColor: '#ffffff' });

    expect(urlRepository.updateQrCodeOptions).toHaveBeenCalledWith('url-1', 'user-1', { backgroundColor: '#ffffff' });
  });

  it('should update qrcode options for a free user with an allowed color', async () => {
    userService.getUser.mockResolvedValue(makeUser(PlanName.FREE));
    const useCase = new UpdateQrCodeOptionsUseCase(urlRepository, userService);

    await useCase.execute('url-1', 'user-1', { backgroundColor: QR_CODE_FREE_COLORS[0] });

    expect(urlRepository.updateQrCodeOptions).toHaveBeenCalled();
  });

  it('should throw FORBIDDEN for free user using a non-allowed background color', async () => {
    userService.getUser.mockResolvedValue(makeUser(PlanName.FREE));
    const useCase = new UpdateQrCodeOptionsUseCase(urlRepository, userService);

    await expect(useCase.execute('url-1', 'user-1', { backgroundColor: '#ffffff' })).rejects.toMatchObject({
      message: URL_ERRORS.QR_CODE_BACKGROUND_COLOR_NOT_ALLOWED_ON_FREE_PLAN,
      status: HTTP_ERROR_CODES.FORBIDDEN,
    });
    expect(urlRepository.updateQrCodeOptions).not.toHaveBeenCalled();
  });

  it('should throw UNAUTHORIZED when user does not exist', async () => {
    userService.getUser.mockResolvedValue(null);
    const useCase = new UpdateQrCodeOptionsUseCase(urlRepository, userService);

    await expect(useCase.execute('url-1', 'user-1', {})).rejects.toMatchObject({
      message: AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED,
      status: HTTP_ERROR_CODES.FORBIDDEN,
    });
    expect(urlRepository.updateQrCodeOptions).not.toHaveBeenCalled();
  });

  it('should throw NOT_FOUND when url does not exist or has no qrcode', async () => {
    userService.getUser.mockResolvedValue(makeUser(PlanName.GROWTH));
    urlRepository.updateQrCodeOptions.mockResolvedValue(false);
    const useCase = new UpdateQrCodeOptionsUseCase(urlRepository, userService);

    await expect(useCase.execute('url-1', 'user-1', {})).rejects.toMatchObject({
      message: URL_ERRORS.URL_NOT_FOUND,
      status: HTTP_ERROR_CODES.NOT_FOUND,
    });
  });
});
