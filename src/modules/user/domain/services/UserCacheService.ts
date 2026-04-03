import { CacheGateway } from '@/modules/link/domain/interfaces/CacheGateway';
import { UserModel } from '@/modules/user/domain/models/User.model';
import { CachedUser } from '@/modules/user/domain/interfaces/IUserService';
import { CacheKeyBuilder } from '@/shared/kernel/CacheKeyBuilder';

const USER_TTL_SECONDS = 300;

export class UserCacheService {
  constructor(private readonly cache: CacheGateway) {}

  async getUser(userId: string): Promise<CachedUser | null> {
    return this.cache.get<CachedUser>(CacheKeyBuilder.user(userId))
  }

  async setUser(user: UserModel): Promise<void> {
    const cached: CachedUser = { id: user.id, email: user.email, plan: user.plan }
    await this.cache.set(CacheKeyBuilder.user(user.id), cached, USER_TTL_SECONDS)
  }

  async deleteUser(userId: string): Promise<void> {
    await this.cache.delete(CacheKeyBuilder.user(userId))
  }
}
