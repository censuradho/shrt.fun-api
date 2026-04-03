import { FastifyInstance } from 'fastify';
import {
  registerLinkPublicRoutes,
  registerLinkRoutes,
  registerLinkStatsRoute,
} from './presentation/routes';

export async function linkPublicModule(app: FastifyInstance) {
  app.register(registerLinkPublicRoutes);
}

export async function linkModule(app: FastifyInstance) {
  app.register(registerLinkRoutes, { prefix: '/url' });
  app.register(registerLinkStatsRoute);
}
