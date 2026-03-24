import { FastifyInstance } from "fastify";
import { makeAuthController } from "../modules/auth.module";


export async function authRoutes(app: FastifyInstance) {
  const controller = makeAuthController(app)

  app.post('/auth/sign-up', controller.signUpWithEmailAndPassword.bind(controller))
}