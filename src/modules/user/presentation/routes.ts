import { authMiddleware } from '@/modules/auth/presentation/middlewares/auth.middleware';
import { updateUsernameDto } from '@/modules/user/application/dtos/update-username.dto';
import { makeUserController } from '@/modules/user/presentation/factories/makeUserController';
import { FastifyInstance } from 'fastify';

export async function registerUserRoutes(app: FastifyInstance) {
  const controller = makeUserController();

  app.patch(
    '/username',
    {
      preHandler: authMiddleware,
      schema: { body: updateUsernameDto },
    },
    controller.updateUsername.bind(controller),
  );
}
