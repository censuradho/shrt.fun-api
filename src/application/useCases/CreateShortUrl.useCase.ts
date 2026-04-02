import { AppError } from "@/domain/errors/AppError";
import { URL_ERRORS } from "@/domain/errors/url.error";
import { IQRCodePort } from "@/domain/interfaces/QRCodePort";
import { IShortUrlGenerateService } from "@/domain/interfaces/IShortUrlGenerateService";
import { IUrlCacheService } from "@/domain/interfaces/IUrlCacheService";
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { CreateUrlDto } from "@/presentation/dtos/url/createUrl.dto";
import { HTTP_ERROR_CODES, HTTP_STATUS_CODES } from "@/shered/httpStatusCodes";

export interface CreateShortUrlResult  {
  shortUrl: string
  qrCode?: string
}

export class CreateShortUrlUseCase {
  constructor (
    private readonly urlRepository: IUrlRepository,
    private readonly urlCacheService: IUrlCacheService,
    private readonly shortUrlGenerateService: IShortUrlGenerateService,
    private readonly userRepository: IUserRepository,
    private readonly qrCodePort: IQRCodePort,
  ) {}

  async execute(supabaseId: string, dto: CreateUrlDto): Promise<CreateShortUrlResult> {
    const { url, slug, title, generateQrCode } = dto;

    const user = await this.userRepository.findUserBySupabaseId(supabaseId);

    if (!user) throw new AppError(URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });

    const { month, today } = await this.urlRepository.countByUserCurrentMonth(supabaseId);
    const dailyLinkLimit = Math.max(1, Math.floor(user.plan.monthlyLinkLimit / 30));

    if (month >= user.plan.monthlyLinkLimit) {
      throw new AppError(URL_ERRORS.MONTHLY_LINK_LIMIT_REACHED, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      });
    }

    if (today >= dailyLinkLimit) {
      throw new AppError(URL_ERRORS.DAILY_LINK_LIMIT_REACHED, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      });
    }

    if (generateQrCode) {
      const qrCodeCount = await this.urlRepository.countQrCodeByUserCurrentMonth(supabaseId);

      if (qrCodeCount >= user.plan.monthlyQrCodeLimit) {
        throw new AppError(URL_ERRORS.MONTHLY_QR_CODE_LIMIT_REACHED, {
          status: HTTP_STATUS_CODES.FORBIDDEN,
        });
      }
    }

    const shortUrl = await this.shortUrlGenerateService.generate(slug);

    const qrCode = generateQrCode
      ? await this.qrCodePort.generate(shortUrl, dto.qrOptions ?? {})
      : undefined;

    const urlId = await this.urlRepository.create(supabaseId, {
      originalUrl: url,
      shortUrl,
      title,
      hasQrCode: generateQrCode,
      ...(generateQrCode && ({
        qrCodeOptions: dto.qrOptions,
      }))
    });

    try {
      await Promise.all([
        this.urlCacheService.setUrl(shortUrl, url, urlId, true, 60 * 60 * 24 * 30),
        this.urlCacheService.incrementTotalUrls(),
      ]);

      return { shortUrl, qrCode };
    } catch {
      await this.urlRepository.delete(urlId);
      throw new AppError(URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL, {
        status: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
