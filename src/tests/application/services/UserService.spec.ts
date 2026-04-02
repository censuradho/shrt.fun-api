import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { UserService } from '@/application/services/UserService';
import { UserCacheService } from '@/application/services/UserCacheService';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { CachedUser } from '@/domain/interfaces/IUserService';
import { UserModel } from '@/domain/models/User.model';

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
  userRepository.me.mockResolvedValue(null);
});

describe('UserService', () => {
  describe('getUser', () => {
    it('should return user from cache without hitting the repository', async () => {
      userCacheService.getUser.mockResolvedValue(CACHED_USER);
      const service = new UserService(userRepository, userCacheService);

      const result = await service.getUser('user-1');

      expect(result).toEqual(CACHED_USER);
      expect(userRepository.me).not.toHaveBeenCalled();
    });

    it('should fetch from repository on cache miss and populate cache', async () => {
      userRepository.me.mockResolvedValue(USER_MODEL);
      const service = new UserService(userRepository, userCacheService);

      const result = await service.getUser('user-1');

      expect(userRepository.me).toHaveBeenCalledWith('user-1');
      expect(userCacheService.setUser).toHaveBeenCalledWith(USER_MODEL);
      expect(result).toEqual(USER_MODEL);
    });

    it('should not populate cache if user is not found in repository', async () => {
      const service = new UserService(userRepository, userCacheService);

      const result = await service.getUser('user-1');

      expect(userRepository.me).toHaveBeenCalledWith('user-1');
      expect(userCacheService.setUser).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
