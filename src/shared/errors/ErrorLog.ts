interface ErrorLogParams {
  err: unknown;
  context: string;
  input?: Record<string, unknown>;
}

export class ErrorLog {
  readonly err: unknown;
  readonly context: string;
  readonly input?: Record<string, unknown>;

  constructor({ err, context, input }: ErrorLogParams) {
    this.err = err;
    this.context = context;
    this.input = input;
  }
}
