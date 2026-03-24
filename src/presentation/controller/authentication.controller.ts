import { SignUpWithEmailAndPasswordUseCase } from "@/application/useCases/SignUpWithEmailAndPassword.useCase";
import type { FastifyReply, FastifyRequest } from "fastify";
import { SignUpDto } from "../dtos/authentication/signUp.dto";

export class AuthenticationController {
  constructor(
    private readonly signUpWithEmailAndPasswordUseCase: SignUpWithEmailAndPasswordUseCase,
  ) {}

  async signUpWithEmailAndPassword(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as SignUpDto;

    await this.signUpWithEmailAndPasswordUseCase.execute({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
    });

    return reply.status(201).send();
  }
}