import { AppError } from "@/domain/errors/AppError";
import { URL_ERRORS } from "@/domain/errors/url.error";
import { IUrlCacheService } from "@/domain/interfaces/IUrlCacheService";
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { IEnvProvider } from "@/domain/services/EnvProvider";
import { CreateUrlDto } from "@/presentation/dtos/url/createUrl.dto";
import { generateHash } from "@/shered/generateHash";
import { HTTP_ERROR_CODES } from "@/shered/httpStatusCodes";
import { slugify } from "@/shered/slugify";
import { addHours } from "date-fns";

export class CreateUrlUseCase {
  constructor (
    private readonly urlRepository: IUrlRepository,
    private readonly urlCacheService: IUrlCacheService,
    private readonly envProvider: IEnvProvider
  ) {}

  async execute(dto: CreateUrlDto): Promise<string> {
    const { url, slug } = dto;
    const hash = slug ?? slugify(url) + generateHash();
    const shortUrl = `${this.envProvider.get('DOMAIN_URL')}/${hash}`;

    const existUrl = await this.urlRepository.getIdByShortUrl(shortUrl);

    if (existUrl) {
      throw new AppError(URL_ERRORS.SHORT_URL_ALREADY_EXISTS, {
        status: HTTP_ERROR_CODES.CONFLICT
      });
    }

    const urlId = await this.urlRepository.create({
      originalUrl: url,
      shortUrl,
      expireAt: addHours(new Date(), 24)
    });

    try {
      await this.urlCacheService.setUrl(shortUrl, url, urlId);
      await this.urlCacheService.incrementTotalUrls();
      return shortUrl;
    } catch {
      await this.urlRepository.delete(urlId);
      throw new AppError(URL_ERRORS.WAS_NOT_POSSIBLE_TO_CREATE_SHORT_URL, {
        status: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR
      });
    }
  }
}
