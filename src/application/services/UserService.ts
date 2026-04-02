import { CachedUser, IUserService } from '@/domain/interfaces/IUserService';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { UserCacheService } from './UserCacheService';

export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userCacheService: UserCacheService,
  ) {}

  async getUser(userId: string): Promise<CachedUser | null> {
    const cached = await this.userCacheService.getUser(userId)
    if (cached) return cached

    const user = await this.userRepository.findUserBySupabaseId(userId)
    if (user) await this.userCacheService.setUser(user)

    return user
  }
}
