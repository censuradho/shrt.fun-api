import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { urlRoutesPrivate } from "./url.private.routes";
import { analyticsRoutesPrivate } from "./analytics.private.routes";

export function routes (app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/auth' })
  app.register(urlRoutesPrivate, { prefix: '/url' })
  app.register(analyticsRoutesPrivate, { prefix: '/analytics' })
  app.register(
    () => app.get('/health', async () => {
      return { status: 'ok' };
    })
  )
}