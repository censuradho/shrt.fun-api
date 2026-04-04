import { UpdateUsernameUseCase } from '@/modules/user/application/use-cases/UpdateUsername.useCase';
import { UserRepository } from '@/modules/user/infra/repositories/UserRepository.prisma';
import { UserController } from '@/modules/user/presentation/controllers/user.controller';
import { prisma } from '@/infra/database/prisma';

export function makeUserController(): UserController {
  const userRepository = new UserRepository(prisma);
  const updateUsernameUseCase = new UpdateUsernameUseCase(userRepository);

  return new UserController(updateUsernameUseCase);
}
