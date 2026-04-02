import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { GenerateQRCodePreviewQuery } from '@/application/queries/generateQRCodePreview.query';
import { IQRCodePort } from '@/domain/interfaces/QRCodePort';
import { IUserService, CachedUser } from '@/domain/interfaces/IUserService';
import { IEnvProvider } from '@/domain/services/EnvProvider';
import { PlanName } from '@/domain/enums/Plan.enum';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { USER_ERRORS_MESSAGES } from '@/domain/errors/user.errors';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';
import { AUTHENTICATION_ERROR_MESSAGES } from '@/domain/errors/authentication.errors';

const qrCodePort = mock<IQRCodePort>();
const userService = mock<IUserService>();
const envProvider = mock<IEnvProvider>();

const makeUser = (planName: string): CachedUser => ({
  id: 'user-1',
  email: 'user@example.com',
  plan: { name: planName, monthlyLinkLimit: 100, monthlyQrCodeLimit: 50 },
})

beforeEach(() => {
  vi.clearAllMocks();
  envProvider.get.mockReturnValue('https://client.example.com');
  qrCodePort.generate.mockResolvedValue('<svg>qrcode</svg>');
});

describe('GenerateQRCodePreviewQuery', () => {
  it('should generate qr code for non-free user', async () => {
    userService.getUser.mockResolvedValue(makeUser(PlanName.GROWTH));
    const query = new GenerateQRCodePreviewQuery(qrCodePort, userService, envProvider);

    const result = await query.execute('user-1', { dotsStyle: 'rounded' });

    expect(qrCodePort.generate).toHaveBeenCalledWith('https://client.example.com', { dotsStyle: 'rounded' });
    expect(result).toBe('<svg>qrcode</svg>');
  });

  it('should throw FORBIDDEN for free plan user', async () => {
    userService.getUser.mockResolvedValue(makeUser(PlanName.FREE));
    const query = new GenerateQRCodePreviewQuery(qrCodePort, userService, envProvider);

    await expect(query.execute('user-1', {})).rejects.toMatchObject({
      message: URL_ERRORS.QR_CODE_PREVIEW_NOT_AVAILABLE_ON_FREE_PLAN,
      status: HTTP_ERROR_CODES.FORBIDDEN,
    });
    expect(qrCodePort.generate).not.toHaveBeenCalled();
  });

  it('should throw UNAUTHORIZED when user does not exist', async () => {
    userService.getUser.mockResolvedValue(null);
    const query = new GenerateQRCodePreviewQuery(qrCodePort, userService, envProvider);

    await expect(query.execute('user-1', {})).rejects.toMatchObject({
      message: AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED,
      status: HTTP_ERROR_CODES.UNAUTHORIZED,
    });
    expect(qrCodePort.generate).not.toHaveBeenCalled();
  });

  it('should fallback to empty string when CLIENT_URL is not set', async () => {
    userService.getUser.mockResolvedValue(makeUser(PlanName.GROWTH));
    envProvider.get.mockReturnValue(undefined);
    const query = new GenerateQRCodePreviewQuery(qrCodePort, userService, envProvider);

    await query.execute('user-1', {});

    expect(qrCodePort.generate).toHaveBeenCalledWith('', {});
  });
});
