import { FastifyInstance } from 'fastify';
import { registerAnalyticsRoutes } from './presentation/routes';

export async function analyticsModule(app: FastifyInstance) {
  app.register(registerAnalyticsRoutes, { prefix: '/analytics' });
}
