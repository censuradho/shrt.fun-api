import { FastifyInstance } from "fastify";
import { makeAuthController } from "../modules/auth.module";
import { signUpDto } from "../dtos/authentication/signUp.dto";
import { authMiddleware } from "../middleware/auth.middleware";


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

  app.get(
    '/me',
    {
      preHandler: [authMiddleware]
    },  
    controller.me.bind(controller)
  )
}