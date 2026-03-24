import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { AuthGateway } from '../../domain/interfaces/AuthGateway';
import { SignUpDto } from "@/presentation/dtos/authentication/signUp.dto";
import { AppError } from '@/domain/errors/AppError';
import { USER_ERRORS_MESSAGES } from '@/domain/errors/user.errors';
import { HTTP_STATUS_CODES } from '@/shered/httpStatusCodes';
import { ErrorLog } from '@/shered/ErrorLog';
import { FastifyInstance } from 'fastify';

export class SignUpWithEmailAndPasswordUseCase {
  constructor (
    private readonly authGateway: AuthGateway,
    private readonly userRepository: IUserRepository,
    private readonly app: FastifyInstance
  ) {}

  async execute (input: SignUpDto) {
    const { email, password, firstName, lastName } = input;

    const userExists = await this.userRepository.checkIfExistsByEmail(email)

    if (userExists) throw new AppError(USER_ERRORS_MESSAGES.USER_ALREADY_EXISTS, {
      status: HTTP_STATUS_CODES.CONFLICT
    })

    const userId = await this.userRepository.create({ email, firstName, lastName })

    try {
      await this.authGateway.signUpWithEmailAndPassword({ email, password })
    } catch(error: any)  {
      await this.userRepository.delete(userId)
      this.app.log.error(
        new ErrorLog({ err: error, context: 'SignUpWithEmailAndPasswordUseCase.execute', input: { email } }),
      )

      throw new AppError(USER_ERRORS_MESSAGES.SIGN_UP_FAILED, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      })
    }
  }
}