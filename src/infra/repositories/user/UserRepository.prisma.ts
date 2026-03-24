import { CreateUserEntityDto } from "@/domain/repositories/dtos/CreateUserEntity.dto";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { nanoid } from "nanoid";
import { PrismaClient } from "prisma/generated/client";

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(payload: CreateUserEntityDto): Promise<string> {
    const data = await this.prisma.user.create({
      data: {
        id: nanoid(),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: `@${payload.firstName.toLocaleLowerCase()}_${Math.floor(Math.random() * 1000)}`
      },
      select: { id: true },
    });

    return data.id;
  }

  async checkIfExistsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
