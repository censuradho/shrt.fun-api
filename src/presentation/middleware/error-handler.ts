import { AppError } from '@/domain/errors/AppError';
import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export const errorHandler = (
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error); 

  if (error instanceof AppError) {
    return reply.status(error.status).send({ message: error.message });
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
}
