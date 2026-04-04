import { FastifyInstance } from 'fastify';
import { registerUserRoutes } from './presentation/routes';

export async function userModule(app: FastifyInstance) {
  app.register(registerUserRoutes, { prefix: '/users' });
}
