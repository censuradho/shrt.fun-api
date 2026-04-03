import { AppError } from "@/shared/errors/AppError";
import { URL_ERRORS } from "@/modules/link/domain/errors/url.error";
import { PlanName } from "@/shared/constants/Plan.enum";
import { QR_CODE_FREE_COLORS } from "@/modules/link/domain/enums/QrCodeFreeColors.enum";
import { QRCodeOptions } from "@/modules/link/domain/interfaces/QRCodePort";
import { IUrlRepository } from "@/modules/link/domain/repositories/IUrlRepository";
import { IUserService } from "@/modules/user/domain/interfaces/IUserService";
import { HTTP_ERROR_CODES } from "@/shared/constants/httpStatusCodes";
import { AUTHENTICATION_ERROR_MESSAGES } from "@/modules/auth/domain/errors/authentication.errors";

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
