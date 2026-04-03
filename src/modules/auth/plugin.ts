import { FastifyInstance } from 'fastify';
import { registerAuthRoutes } from './presentation/routes';

export async function authModule(app: FastifyInstance) {
  app.register(registerAuthRoutes, { prefix: '/auth' });
}
