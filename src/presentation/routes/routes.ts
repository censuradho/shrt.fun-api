import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { urlRoutesPrivate } from "./url.private.routes";

export function routes (app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/auth' })
  app.register(urlRoutesPrivate, { prefix: '/url' })
}