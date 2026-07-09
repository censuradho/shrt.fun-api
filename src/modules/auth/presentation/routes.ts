import { makeAuthController } from './factories/makeAuthController';
import { authMiddleware } from '@/modules/auth/presentation/middlewares/auth.middleware';
import { userResponseDto } from '@/modules/user/application/dtos/user-response.dto';
import { FastifyInstance } from 'fastify';
import { signUpDto } from './schemas/sign-up.schema';

export async function registerAuthRoutes(app: FastifyInstance) {
  const controller = makeAuthController(app);

  app.post(
    '/sign-up',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Cria uma nova conta com e-mail e senha',
        body: signUpDto,
      },
    },
    controller.signUpWithEmailAndPassword.bind(controller),
  );

  app.get(
    '/me',
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ['Auth'],
        summary: 'Retorna os dados do usuário autenticado',
        security: [{ bearerAuth: [] }],
        response: { 200: userResponseDto.nullable() },
      },
    },
    controller.me.bind(controller),
  );
}
