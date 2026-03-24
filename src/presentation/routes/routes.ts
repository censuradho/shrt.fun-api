import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";

export function routes (app: FastifyInstance) {
  app.register(
    () => authRoutes(app),
    { prefix: '/auth' }
  )
}