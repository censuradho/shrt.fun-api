import { UpdateUsernameUseCase } from '@/modules/user/application/use-cases/UpdateUsername.useCase';
import { UpdateUsernameDto } from '@/modules/user/application/dtos/update-username.dto';
import { HTTP_STATUS_CODES } from '@/shared/constants/httpStatusCodes';
import { FastifyReply, FastifyRequest } from 'fastify';

export class UserController {
  constructor(
    private readonly updateUsernameUseCase: UpdateUsernameUseCase,
  ) {}

  async updateUsername(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.body as UpdateUsernameDto;
    await this.updateUsernameUseCase.execute(request.user.id, username);
    return reply.status(HTTP_STATUS_CODES.NO_CONTENT).send();
  }
}
