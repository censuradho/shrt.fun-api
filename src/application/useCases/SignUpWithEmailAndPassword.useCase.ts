import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { AuthGateway } from '../../domain/interfaces/AuthGateway';
import { SignUpDto } from "@/presentation/dtos/authentication/signUp.dto";
import { AppError } from '@/domain/errors/AppError';
import { USER_ERRORS_MESSAGES } from '@/domain/errors/user.errors';
import { HTTP_STATUS_CODES } from '@/shered/httpStatusCodes';
import { ErrorLog } from '@/shered/ErrorLog';
import { FastifyInstance } from 'fastify';
import { delay } from '@/utils/delay';
import { AUTHENTICATION_ERROR_MESSAGES } from '@/domain/errors/authentication.errors';

export class SignUpWithEmailAndPasswordUseCase {
  constructor (
    private readonly authGateway: AuthGateway,
    private readonly userRepository: IUserRepository,
    private readonly app: FastifyInstance
  ) {}

  async execute (input: SignUpDto) {
    const { email, password, firstName, lastName } = input;

    const userExists = await this.userRepository.checkIfExistsByEmail(email)

    if (userExists) {
      await delay(1000) // Adiciona um atraso para dificultar ataques de enumeração de usuários
      throw new AppError(USER_ERRORS_MESSAGES.USER_ALREADY_EXISTS, {
        status: HTTP_STATUS_CODES.CONFLICT
      })
    }

    let userId: string | null = null

    try {
      const supabaseUser = await this.authGateway.signUpWithEmailAndPassword({ email, password })
      const user = await this.userRepository.create({ email, firstName, lastName, supabaseId: supabaseUser.id })

      userId = user
    } catch(error: any)  {
      if (userId) await this.userRepository.delete(userId)

      this.app.log.error(
        new ErrorLog({ err: error, context: 'SignUpWithEmailAndPasswordUseCase.execute', input: { email } }),
      )

      throw new AppError(AUTHENTICATION_ERROR_MESSAGES.SIGN_UP_FAILED, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      })
    }
  }
}