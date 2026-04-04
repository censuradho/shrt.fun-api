import { AppError } from '@/shared/errors/AppError';
import { HTTP_STATUS_CODES } from '@/shared/constants/httpStatusCodes';
import { IUserRepository } from '@/modules/user/domain/repositories/IUserRepository';
import { USER_ERRORS_MESSAGES } from '@/modules/user/domain/errors/user.errors';

export class UpdateUsernameUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(supabaseId: string, username: string): Promise<void> {
    const taken = await this.userRepository.checkIfUsernameExists(username);
    if (taken)
      throw new AppError(USER_ERRORS_MESSAGES.USERNAME_ALREADY_TAKEN, {
        status: HTTP_STATUS_CODES.CONFLICT,
      });

    await this.userRepository.updateUsername(supabaseId, username);
  }
}
