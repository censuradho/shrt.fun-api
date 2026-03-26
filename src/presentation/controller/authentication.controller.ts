import { SignUpWithEmailAndPasswordUseCase } from "@/application/useCases/SignUpWithEmailAndPassword.useCase";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { SignUpDto } from "../dtos/authentication/signUp.dto";
import { AppError } from "@/domain/errors/AppError";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { ErrorLog } from "@/shered/ErrorLog";

export class AuthenticationController {
  constructor(
    private readonly signUpWithEmailAndPasswordUseCase: SignUpWithEmailAndPasswordUseCase,
    private readonly userRepository: IUserRepository,
    private readonly app: FastifyInstance
  ) {}

  async signUpWithEmailAndPassword(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as SignUpDto;
    try {

      await this.signUpWithEmailAndPasswordUseCase.execute({
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
      });

      return reply.status(200).send();
    } catch (error: unknown) {
      
      this.app.log.error(
        new ErrorLog({ 
          err: error, 
          context: 'AuthenticationController.signUpWithEmailAndPassword', 
          input: { email: body.email } 
        }),
      )
      if (error instanceof AppError) {
        return reply.status(200).send()
      }

      throw error
    }
  }

  async me (request: FastifyRequest, reply: FastifyReply) {
    const supabaseId = request.user.id

    const user = await this.userRepository.findUserBySupabaseId(supabaseId)

    return reply.send(user)
  }
}