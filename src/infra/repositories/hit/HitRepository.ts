import { CreateHitEntityDto } from "@/domain/repositories/dtos/CreateHitEntity.dto";
import { IHitRepository } from "@/domain/repositories/IHitRepository";
import { PrismaClient } from "prisma/generated/client";

export class HitRepository implements IHitRepository {
  constructor (private readonly prisma: PrismaClient) {}
  
  async incrementHitCount(payload: CreateHitEntityDto): Promise<void> {
    await this.prisma.hit.create({
      data: {
        urlId: payload.urlId,
        id: payload.id,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      }
    })
  }
}