import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IPlanRepository } from '@/domain/repositories/IPlanRepository';
import { AuthGateway } from '../../domain/interfaces/AuthGateway';
import { SignUpDto } from "@/presentation/dtos/authentication/signUp.dto";
import { AppError } from '@/domain/errors/AppError';
import { USER_ERRORS_MESSAGES } from '@/domain/errors/user.errors';
import { HTTP_STATUS_CODES } from '@/shered/httpStatusCodes';
import { ErrorLog } from '@/shered/ErrorLog';
import { FastifyInstance } from 'fastify';
import { delay } from '@/utils/delay';
import { AUTHENTICATION_ERROR_MESSAGES } from '@/domain/errors/authentication.errors';
import { PlanName } from '@/domain/enums/Plan.enum';
import { IEnvProvider } from '@/domain/services/EnvProvider';

export class SignUpWithEmailAndPasswordUseCase {
  constructor (
    private readonly authGateway: AuthGateway,
    private readonly userRepository: IUserRepository,
    private readonly planRepository: IPlanRepository,
    private readonly envProvider: IEnvProvider,
    private readonly app: FastifyInstance,
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

    const freePlan = await this.planRepository.findByName(PlanName.FREE)

    if (!freePlan) throw new AppError(AUTHENTICATION_ERROR_MESSAGES.SIGN_UP_FAILED, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    })

    let userId: string | null = null

    try {
      const supabaseUser = await this.authGateway.signUpWithEmailAndPassword({ 
        email, 
        password,
        options: {
          emailRedirectTo: this.envProvider.get("CLIENT_URL"),
        },
      })
      const user = await this.userRepository.create({ 
        email, 
        firstName, 
        lastName, 
        supabaseId: supabaseUser.id, 
        planId: freePlan.id 
      })

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