export class AppError extends Error {
  public readonly code?: string;
  public readonly status: number;


  constructor(
    message: string, 
    options: { code?: string; status: number, errors?: { reason: string; value: any }[] } = {
      code: message,
      status: 400,
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options?.code;
    this.status = options.status;
    Error.captureStackTrace(this, this.constructor);
  }
}
