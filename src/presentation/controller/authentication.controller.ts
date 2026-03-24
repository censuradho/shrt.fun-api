import { SignUpWithEmailAndPasswordUseCase } from "@/application/useCases/SignUpWithEmailAndPassword.useCase";
import type { FastifyReply, FastifyRequest } from "fastify";
import { SignUpDto } from "../dtos/authentication/signUp.dto";
import { AppError } from "@/domain/errors/AppError";

export class AuthenticationController {
  constructor(
    private readonly signUpWithEmailAndPasswordUseCase: SignUpWithEmailAndPasswordUseCase,
  ) {}

  async signUpWithEmailAndPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as SignUpDto;

      await this.signUpWithEmailAndPasswordUseCase.execute({
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
      });

      return reply.status(200).send();
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return reply.status(200).send()
      }

      throw error
    }
  }
}