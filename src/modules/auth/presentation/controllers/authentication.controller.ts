import { SignUpWithEmailAndPasswordUseCase } from '@/modules/auth/application/use-cases/SignUpWithEmailAndPassword.useCase';
import { AppError } from '@/shared/errors/AppError';
import { IUserRepository } from '@/modules/user/domain/repositories/IUserRepository';
import { SignUpDto } from '@/modules/auth/application/dtos/sign-up.dto';
import { ErrorLog } from '@/shared/errors/ErrorLog';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export class AuthenticationController {
  constructor(
    private readonly signUpWithEmailAndPasswordUseCase: SignUpWithEmailAndPasswordUseCase,
    private readonly userRepository: IUserRepository,
    private readonly app: FastifyInstance,
  ) {}

  async signUpWithEmailAndPassword(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as SignUpDto;
    try {
      this.app.log.info(`[AuthenticationController.signUpWithEmailAndPassword] Starting sign up process for email: ${body.email}`);

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
          input: { email: body.email },
        }),
      );

      if (error instanceof AppError) {
        return reply.status(200).send();
      }

      throw error;
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const supabaseId = request.user.id;

    const user = await this.userRepository.findUserBySupabaseId(supabaseId);

    return reply.send(user);
  }
}
