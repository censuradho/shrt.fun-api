import { AppError } from "@/domain/errors/AppError";
import { URL_ERRORS } from "@/domain/errors/url.error";
import { PlanName } from "@/domain/enums/Plan.enum";
import { IQRCodePort, QRCodeOptions } from "@/domain/interfaces/QRCodePort";
import { IEnvProvider } from "@/domain/services/EnvProvider";
import { IUserService } from "@/domain/interfaces/IUserService";
import { HTTP_ERROR_CODES } from "@/shared/httpStatusCodes";
import { AUTHENTICATION_ERROR_MESSAGES } from "@/domain/errors/authentication.errors";

export class GenerateQRCodePreviewQuery {
  constructor(
    private readonly qrCodePort: IQRCodePort,
    private readonly userService: IUserService,
    private readonly envProvider: IEnvProvider,
  ) {}

  async execute(userId: string, options: QRCodeOptions): Promise<string> {
    const user = await this.userService.getUser(userId)

    if (user?.plan.name === PlanName.FREE) {
      throw new AppError(URL_ERRORS.QR_CODE_PREVIEW_NOT_AVAILABLE_ON_FREE_PLAN, {
        status: HTTP_ERROR_CODES.FORBIDDEN
      })
    }
    
    if (!user) throw new AppError(AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED, {
      status: HTTP_ERROR_CODES.UNAUTHORIZED
    })

    const clientUrl = this.envProvider.get('CLIENT_URL') ?? ''

    return this.qrCodePort.generate(clientUrl, options)
  }
}
