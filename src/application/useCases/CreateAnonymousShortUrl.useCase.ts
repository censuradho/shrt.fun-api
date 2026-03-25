import { AppError } from "@/domain/errors/AppError";
import { URL_ERRORS } from "@/domain/errors/url.error";
import { IShortUrlGenerateService } from "@/domain/interfaces/IShortUrlGenerateService";
import { IUrlCacheService } from "@/domain/interfaces/IUrlCacheService";
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { CreateUrlDto } from "@/presentation/dtos/url/createUrl.dto";
import { HTTP_ERROR_CODES } from "@/shered/httpStatusCodes";

export class CreateAnonymousShortUrl {
  constructor (
    private readonly urlRepository: IUrlRepository,
    private readonly urlCacheService: IUrlCacheService,
    private readonly shortUrlGenerateService: IShortUrlGenerateService
  ) {}

  async execute(dto: CreateUrlDto): Promise<string> {
    const { url, slug } = dto;

    const shortUrl = await this.shortUrlGenerateService.generate(slug);

    const urlId = await this.urlRepository.createAnonymous({
      originalUrl: url,
      shortUrl,
    });

    try {
      await Promise.all([
        this.urlCacheService.setUrl(shortUrl, url, urlId, 60 * 60 * 24 * 30),
        this.urlCacheService.incrementTotalUrls(),
      ])

      return shortUrl;
    } catch {
      await this.urlRepository.delete(urlId);
      throw new AppError(URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL, {
        status: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR
      });
    }
  }
}
