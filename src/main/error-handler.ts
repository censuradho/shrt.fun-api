import { AppError } from '@/shared/errors/AppError';
import { HTTP_ERROR_CODES } from '@/shared/constants/httpStatusCodes';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export const errorHandler = (
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.status).send({ message: error.message });
  }

  const isRateLimitError =
    error.statusCode === HTTP_ERROR_CODES.TOO_MANY_REQUESTS ||
    (error.statusCode === HTTP_ERROR_CODES.FORBIDDEN && error.message?.includes('Rate limit exceeded'));

  if (isRateLimitError) {
    return reply
      .status(HTTP_ERROR_CODES.TOO_MANY_REQUESTS)
      .send({ message: 'RATE_LIMIT_EXCEEDED' });
  }

  if (error.validation) {
    const errors = error.validation.map((err: any) => ({
      field: err.instancePath?.replace(/^\//, '') || err.dataPath?.replace(/^\./, '') || '',
      message: err.message,
    }));
    reply.status(400).send({ errors });
  } else {
    reply.status(500).send({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
