import { makeAuthController } from './factories/makeAuthController';
import { authMiddleware } from '@/modules/auth/presentation/middlewares/auth.middleware';
import { FastifyInstance } from 'fastify';
import { signUpDto } from './schemas/sign-up.schema';

export async function registerAuthRoutes(app: FastifyInstance) {
  const controller = makeAuthController(app);

  app.post(
    '/sign-up',
    {
      schema: {
        body: signUpDto,
      },
    },
    controller.signUpWithEmailAndPassword.bind(controller),
  );

  app.get(
    '/me',
    {
      preHandler: [authMiddleware],
    },
    controller.me.bind(controller),
  );
}
