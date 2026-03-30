import { AppError } from "@/domain/errors/AppError";
import { URL_ERRORS } from "@/domain/errors/url.error";
import { IShortUrlGenerateService } from "@/domain/interfaces/IShortUrlGenerateService";
import { IUrlRepository } from "@/domain/repositories/IUrlRepository";
import { IEnvProvider } from "@/domain/services/EnvProvider";
import { generateHash } from "@/shered/generateHash";
import { HTTP_ERROR_CODES } from "@/shered/httpStatusCodes";
import { slugify } from "@/shered/slugify";

export class ShortUrlGenerateService implements IShortUrlGenerateService {
  constructor (
      private readonly urlRepository: IUrlRepository,
      private readonly envProvider: IEnvProvider,
  ) {}

  async generate(slug?: string): Promise<string> {
    const hash = slug ? slugify(slug) : generateHash();
    
    const shortUrl = `${this.envProvider.get('REDIRECT_CLIENT_URL')}/${hash}`;
    
    const existUrl = await this.urlRepository.getIdByShortUrl(shortUrl);

    if (existUrl) {
      throw new AppError(URL_ERRORS.SHORT_URL_ALREADY_EXISTS, {
        status: HTTP_ERROR_CODES.CONFLICT
      });
    }

    return shortUrl;
  }
}