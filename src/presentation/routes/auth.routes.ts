import { FastifyInstance } from "fastify";
import { makeAuthController } from "../modules/auth.module";
import { signUpDto } from "../dtos/authentication/signUp.dto";


export async function authRoutes(app: FastifyInstance) {
  const controller = makeAuthController(app)

  app.post(
    '/sign-up',
    {
      schema: {
        body: signUpDto
      }
    },
    controller.signUpWithEmailAndPassword.bind(controller)
  )
}