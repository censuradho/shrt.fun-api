import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { UserService } from '@/modules/user/domain/services/UserService';
import { UserCacheService } from '@/modules/user/domain/services/UserCacheService';
import { IUserRepository } from '@/modules/user/domain/repositories/IUserRepository';
import { CachedUser } from '@/modules/user/domain/interfaces/IUserService';
import { UserModel } from '@/modules/user/domain/models/User.model';

const userRepository = mock<IUserRepository>();
const userCacheService = mock<UserCacheService>();

const USER_MODEL: UserModel = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  isActive: true,
  createdAt: new Date(),
  plan: { name: 'PRO', monthlyLinkLimit: 100, monthlyQrCodeLimit: 50 },
}

const CACHED_USER: CachedUser = {
  id: 'user-1',
  email: 'user@example.com',
  plan: { name: 'PRO', monthlyLinkLimit: 100, monthlyQrCodeLimit: 50 },
}

beforeEach(() => {
  vi.clearAllMocks();
  userCacheService.getUser.mockResolvedValue(null);
  userCacheService.setUser.mockResolvedValue(undefined);
  userRepository.findUserBySupabaseId.mockResolvedValue(null);
});

describe('UserService', () => {
  describe('getUser', () => {
    it('should return user from cache without hitting the repository', async () => {
      userCacheService.getUser.mockResolvedValue(CACHED_USER);
      const service = new UserService(userRepository, userCacheService);

      const result = await service.getUser('user-1');

      expect(result).toEqual(CACHED_USER);
      expect(userRepository.findUserBySupabaseId).not.toHaveBeenCalled();
    });

    it('should fetch from repository on cache miss and populate cache', async () => {
      userRepository.findUserBySupabaseId.mockResolvedValue(USER_MODEL);
      const service = new UserService(userRepository, userCacheService);

      const result = await service.getUser('user-1');

      expect(userRepository.findUserBySupabaseId).toHaveBeenCalledWith('user-1');
      expect(userCacheService.setUser).toHaveBeenCalledWith(USER_MODEL);
      expect(result).toEqual(USER_MODEL);
    });

    it('should not populate cache if user is not found in repository', async () => {
      const service = new UserService(userRepository, userCacheService);

      const result = await service.getUser('user-1');

      expect(userRepository.findUserBySupabaseId).toHaveBeenCalledWith('user-1');
      expect(userCacheService.setUser).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
