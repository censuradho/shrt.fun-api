import { IPlanRepository, PlanModel } from '@/domain/repositories/IPlanRepository';
import { PrismaClient } from 'prisma/generated/client';

export class PlanRepository implements IPlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<PlanModel | null> {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<PlanModel | null> {
    return this.prisma.plan.findFirst({ where: { name } });
  }
}
