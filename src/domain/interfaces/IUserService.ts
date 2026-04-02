import { UserModel } from '@/domain/models/User.model';

export type CachedUser = Pick<UserModel, 'id' | 'email'> & { plan: UserModel['plan'] }

export interface IUserService {
  getUser(userId: string): Promise<CachedUser | null>
}
