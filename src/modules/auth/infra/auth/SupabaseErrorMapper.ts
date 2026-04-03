import { AppError } from "@/shared/errors/AppError";
import { HTTP_ERROR_CODES } from "@/shared/constants/httpStatusCodes";

export interface SupabaseErrorLike {
  status?: number;
  message?: string;
  code?: string;
  name?: string;
}

export class SupabaseErrorMapper {
  static toAppError(
    error: SupabaseErrorLike,
    fallbackMessage = "Supabase error"
  ) {
    const message = error?.message ?? fallbackMessage;

    if (/(already exists|duplicate)/i.test(message)) {
      return new AppError(message, {
        status: HTTP_ERROR_CODES.CONFLICT,
        code: error?.code ?? error?.name
      });
    }

    if (/password/i.test(message)) {
      return new AppError(message, {
        status: HTTP_ERROR_CODES.BAD_REQUEST,
        code: error?.code ?? error?.name
      });
    }

    const status = this.normalizeStatus(error?.status);

    return new AppError(message, {
      status,
      code: error?.code ?? error?.name
    });
  }

  private static normalizeStatus(status?: number) {
    if (!status) return HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR;

    const allowedStatuses = Object.values(HTTP_ERROR_CODES) as number[];
    if (allowedStatuses.includes(status)) return status;

    return HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR;
  }
}
