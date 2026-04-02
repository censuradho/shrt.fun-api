import { AppError } from "@/domain/errors/AppError";
import { URL_ERRORS } from "@/domain/errors/url.error";
import { PlanName } from "@/domain/enums/Plan.enum";
import { QR_CODE_FREE_COLORS } from "@/domain/enums/QrCodeFreeColors.enum";
import { QRCodeOptions } from "@/domain/interfaces/QRCodePort";
import { IUrlRepository } from "@/domain/repositories/IUrlRepository";
import { IUserService } from "@/domain/interfaces/IUserService";
import { HTTP_ERROR_CODES } from "@/shered/httpStatusCodes";
import { AUTHENTICATION_ERROR_MESSAGES } from "@/domain/errors/authentication.errors";

export class UpdateQrCodeOptionsUseCase {
  constructor(
    private readonly urlRepository: IUrlRepository,
    private readonly userService: IUserService,
  ) {}

  async execute(urlId: string, supabaseId: string, options: QRCodeOptions): Promise<void> {
    const user = await this.userService.getUser(supabaseId)

    if (!user) {
      throw new AppError(AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED, { status: HTTP_ERROR_CODES.FORBIDDEN })
    }

    if (user.plan.name === PlanName.FREE) {
      const backgroundColor = options.backgroundColor
      if (backgroundColor && !(QR_CODE_FREE_COLORS as readonly string[]).includes(backgroundColor)) {
        throw new AppError(URL_ERRORS.QR_CODE_BACKGROUND_COLOR_NOT_ALLOWED_ON_FREE_PLAN, {
          status: HTTP_ERROR_CODES.FORBIDDEN,
        })
      }
    }

    const updated = await this.urlRepository.updateQrCodeOptions(urlId, supabaseId, options as Record<string, unknown>)

    if (!updated) {
      throw new AppError(URL_ERRORS.URL_NOT_FOUND, { status: HTTP_ERROR_CODES.NOT_FOUND })
    }
  }
}
