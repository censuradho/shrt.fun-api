import { AppError } from "@/shared/errors/AppError";
import { UpdateUrlEntityDto } from "../../domain/repositories/dtos/UpdateUrlEntity";
import { IUrlRepository } from "../../domain/repositories/IUrlRepository";
import { URL_ERRORS } from "../../domain/errors/url.error";
import { HTTP_ERROR_CODES } from "@/shared/constants/httpStatusCodes";

export class UpdateShortUrlUseCase {
  constructor (private urlRepository: IUrlRepository) {}

  async execute (id: string, supabaseId: string, payload: UpdateUrlEntityDto) {
    const url = await this.urlRepository.findById(id, supabaseId)

    
    if (!url)
      throw new AppError(URL_ERRORS.URL_NOT_FOUND, {
        status: HTTP_ERROR_CODES.NOT_FOUND
      })

    await this.urlRepository.update(id, supabaseId, payload);
  }
}
