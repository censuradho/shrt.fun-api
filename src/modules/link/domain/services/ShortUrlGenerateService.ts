import { AppError } from "@/shared/errors/AppError";
import { URL_ERRORS } from "@/modules/link/domain/errors/url.error";
import { IShortUrlGenerateService } from "@/modules/link/domain/interfaces/IShortUrlGenerateService";
import { IUrlRepository } from "@/modules/link/domain/repositories/IUrlRepository";
import { IEnvProvider } from "@/shared/types/interfaces/EnvProvider";
import { generateHash } from "@/shared/helpers/generateHash";
import { HTTP_ERROR_CODES } from "@/shared/constants/httpStatusCodes";
import { slugify } from "@/shared/helpers/slugify";

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