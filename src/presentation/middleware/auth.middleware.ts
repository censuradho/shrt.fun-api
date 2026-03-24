import { AUTHENTICATION_ERROR_MESSAGES } from '@/domain/errors/authentication.errors';
import { HTTP_ERROR_CODES } from '@/shered/httpStatusCodes';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {

    const hasAuthorizationHeader = request.headers['authorization'];

    if (!hasAuthorizationHeader) {
      return reply
        .status(HTTP_ERROR_CODES.UNAUTHORIZED)
        .send({ error: AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED_AUTHENTICATION_HEADER_NOT_FOUND });
    }

    try {
      await request.jwtVerify();
    } catch (jwtError) {
      request.log.error(jwtError);
      return reply
        .status(HTTP_ERROR_CODES.UNAUTHORIZED)
        .send({ error: AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED });
    }

    const { value, valid } = request.unsignCookie(request.cookies.localUser ?? '')


    if (value && valid) {
      try {
        const localUser = JSON.parse(value)

        request['localUser'] = localUser

      } catch (error) {
        request.log.error(error)
      }
    }

  } catch (err) {
    request.log.error(err)
    reply
      .status(HTTP_ERROR_CODES.UNAUTHORIZED)
      .send({ error: AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED });
  }
}