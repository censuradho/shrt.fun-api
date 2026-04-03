import { AppError } from "@/domain/errors/AppError";
import { URL_ERRORS } from "@/domain/errors/url.error";
import type { IQRCodePort, QRCodeOptions } from "@/domain/interfaces/QRCodePort";
import { IUrlRepository } from "@/domain/repositories/IUrlRepository";
import { HTTP_ERROR_CODES } from "@/shared/httpStatusCodes";
import { toQrUrl } from "@/utils/toQrUrl";

export class GetLinkQRCodeQuery {
  constructor(
    private readonly urlRepository: IUrlRepository,
    private readonly qrCodePort: IQRCodePort,
  ) {}

  async execute(id: string, supabaseId: string) {
    const url = await this.urlRepository.findById(id, supabaseId);

    if (!url) throw new AppError(URL_ERRORS.URL_NOT_FOUND, {
      status: HTTP_ERROR_CODES.NOT_FOUND
    })

    if (!url.hasQrCode || !url.qrCodeOptions) throw new AppError(URL_ERRORS.QR_CODE_NOT_GENERATED, {
      status: HTTP_ERROR_CODES.UNPROCESSABLE_ENTITY
    })

    const qrCode = await this.qrCodePort.generate(
      toQrUrl(url.shortUrl),
      url.qrCodeOptions as QRCodeOptions
    )

    return { qrCode }
  }
}