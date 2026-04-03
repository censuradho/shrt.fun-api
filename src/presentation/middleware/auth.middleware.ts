import { AppError } from '@/domain/errors/AppError';
import { AUTHENTICATION_ERROR_MESSAGES } from '@/domain/errors/authentication.errors';
import { supabaseClient } from '@/infra/auth/client';
import { SupabaseAuthGateway } from '@/infra/auth/SupabaseAuthGateway';
import { envProvider } from '@/infra/config/ProcessEnvProvider';
import { HTTP_ERROR_CODES } from '@/shared/httpStatusCodes';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers['authorization']?.replace('Bearer ', '')

    const authGateway = new SupabaseAuthGateway(supabaseClient, envProvider)

    if (!token) {
      return reply
        .status(HTTP_ERROR_CODES.UNAUTHORIZED)
        .send({ error: AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED_AUTHENTICATION_HEADER_NOT_FOUND });
    }

    const user = await authGateway.getUser(token)

    if (!user) throw new AppError(AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED, {
      status: HTTP_ERROR_CODES.UNAUTHORIZED
    })

    request['user'] = {
      email: user.email,
      id: user.id,
    }

  } catch (err) {
    request.log.error(err)
    reply
      .status(HTTP_ERROR_CODES.UNAUTHORIZED)
      .send({ error: AUTHENTICATION_ERROR_MESSAGES.UNAUTHORIZED });
  }
}