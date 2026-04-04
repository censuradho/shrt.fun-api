import { UserModel } from "@/modules/user/domain/models/User.model";
import { CreateUserEntityDto } from "@/modules/user/domain/repositories/dtos/CreateUserEntity.dto";
import { IUserRepository } from "@/modules/user/domain/repositories/IUserRepository";
import { nanoid } from "nanoid";
import { PrismaClient } from "@/generated/prisma/client";

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async findUserBySupabaseId(supabaseId: string): Promise<UserModel | null> {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      include: { plan: { select: { id: true, name: true, monthlyLinkLimit: true, monthlyQrCodeLimit: true } } },
    });

    return user ? ({
      createdAt: user.createdAt,
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      isActive: user.isActive,
      username: user.username,
      plan: user.plan,
    }) : null;
  }

  async me (id: string): Promise<UserModel | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { 
        plan: { 
          select: { 
            id: true, 
            name: true, 
            monthlyLinkLimit: true, 
            monthlyQrCodeLimit: true 
          } 
        } 
      },
    });

    return user ? ({
      createdAt: user.createdAt,
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      isActive: user.isActive,
      username: user.username,
      plan: user.plan,
    }) : null
  }

  async create(payload: CreateUserEntityDto): Promise<string> {
    const data = await this.prisma.user.create({
      data: {
        id: nanoid(),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: `@${payload.firstName.toLocaleLowerCase()}_${Math.floor(Math.random() * 1000)}`,
        supabaseId: payload.supabaseId,
        planId: payload.planId,
      },
      select: { id: true },
    });

    return data.id;
  }

  async checkIfExistsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async checkIfUsernameExists(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { username } });
    return count > 0;
  }

  async updateUsername(supabaseId: string, username: string): Promise<void> {
    await this.prisma.user.update({
      where: { supabaseId },
      data: { username },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
