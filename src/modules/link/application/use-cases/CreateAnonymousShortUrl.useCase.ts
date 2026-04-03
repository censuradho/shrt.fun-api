import { AppError } from "@/shared/errors/AppError";
import { URL_ERRORS } from "@/modules/link/domain/errors/url.error";
import { IShortUrlGenerateService } from "@/modules/link/domain/interfaces/IShortUrlGenerateService";
import { IUrlCacheService } from "@/modules/link/domain/interfaces/IUrlCacheService";
import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { CreateUrlDto } from "@/modules/link/application/dtos/create-url.dto";
import { HTTP_ERROR_CODES } from "@/shared/constants/httpStatusCodes";
import {  addDays } from 'date-fns'

export class CreateAnonymousShortUrl {
  constructor (
    private readonly urlRepository: IUrlRepository,
    private readonly urlCacheService: IUrlCacheService,
    private readonly shortUrlGenerateService: IShortUrlGenerateService
  ) {}

  async execute(dto: CreateUrlDto): Promise<string> {
    const { url, slug, title } = dto;

    const shortUrl = await this.shortUrlGenerateService.generate(slug);

    const expireInSeconds = 60 * 60 * 24 * 6; // 6 days

    const urlId = await this.urlRepository.createAnonymous({
      originalUrl: url,
      shortUrl,
      title,
      expireAt: addDays(new Date(), 6)
    });


    try {
      await Promise.all([
        this.urlCacheService.setUrl(shortUrl, url, urlId, true, expireInSeconds),
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
