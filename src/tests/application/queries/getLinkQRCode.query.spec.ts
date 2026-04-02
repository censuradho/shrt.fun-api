import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { GetLinkQRCodeQuery } from '@/application/queries/getLinkQRCode.query';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { IQRCodePort } from '@/domain/interfaces/QRCodePort';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';
import { UrlModel } from '@/domain/models/UrlModel';

const urlRepository = mock<IUrlRepository>();
const qrCodePort = mock<IQRCodePort>();

const makeUrl = (overrides: Partial<UrlModel> = {}): UrlModel => ({
  id: 'url-id',
  originalUrl: 'https://example.com',
  shortUrl: 'https://shrt.fun/abc123',
  title: null,
  hitsCount: 0,
  isActive: true,
  description: null,
  tags: [],
  expireAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  hasQrCode: true,
  qrCodeOptions: { dotsStyle: 'rounded', dotsColor: '#000000' },
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe('GetLinkQRCodeQuery', () => {
  it('should return the generated qr code', async () => {
    const url = makeUrl();
    urlRepository.findById.mockResolvedValue(url);
    qrCodePort.generate.mockResolvedValue('data:image/png;base64,abc');

    const query = new GetLinkQRCodeQuery(urlRepository, qrCodePort);
    const result = await query.execute('url-id', 'user-id');

    expect(urlRepository.findById).toHaveBeenCalledWith('url-id', 'user-id');
    expect(qrCodePort.generate).toHaveBeenCalledWith(url.shortUrl, url.qrCodeOptions);
    expect(result).toEqual({ qrCode: 'data:image/png;base64,abc' });
  });

  it('should throw URL_NOT_FOUND when url does not exist', async () => {
    urlRepository.findById.mockResolvedValue(null);

    const query = new GetLinkQRCodeQuery(urlRepository, qrCodePort);

    await expect(query.execute('url-id', 'user-id')).rejects.toMatchObject({
      message: URL_ERRORS.URL_NOT_FOUND,
      status: HTTP_ERROR_CODES.NOT_FOUND,
    });
    expect(qrCodePort.generate).not.toHaveBeenCalled();
  });

  it('should throw QR_CODE_NOT_GENERATED when hasQrCode is false', async () => {
    urlRepository.findById.mockResolvedValue(makeUrl({ hasQrCode: false }));

    const query = new GetLinkQRCodeQuery(urlRepository, qrCodePort);

    await expect(query.execute('url-id', 'user-id')).rejects.toMatchObject({
      message: URL_ERRORS.QR_CODE_NOT_GENERATED,
      status: HTTP_ERROR_CODES.UNPROCESSABLE_ENTITY,
    });
    expect(qrCodePort.generate).not.toHaveBeenCalled();
  });

  it('should throw QR_CODE_NOT_GENERATED when qrCodeOptions is null', async () => {
    urlRepository.findById.mockResolvedValue(makeUrl({ hasQrCode: true, qrCodeOptions: null }));

    const query = new GetLinkQRCodeQuery(urlRepository, qrCodePort);

    await expect(query.execute('url-id', 'user-id')).rejects.toMatchObject({
      message: URL_ERRORS.QR_CODE_NOT_GENERATED,
      status: HTTP_ERROR_CODES.UNPROCESSABLE_ENTITY,
    });
    expect(qrCodePort.generate).not.toHaveBeenCalled();
  });
});
