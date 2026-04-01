import { describe, it, expect, beforeEach } from 'vitest';
import { MockContext, Context, createMockContext } from '@/tests/prismaContext';
import { PlanRepository } from '@/infra/repositories/plan/PlanRepository.prisma';

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

describe('PlanRepository', () => {
  describe('findByName', () => {
    it('should return plan when found', async () => {
      const repo = new PlanRepository(ctx.prisma);
      const plan = { id: 'plan-id', name: 'FREE', monthlyLinkLimit: 10, createdAt: new Date(), updatedAt: new Date() };
      mockCtx.prisma.plan.findFirst.mockResolvedValue(plan as any);

      const result = await repo.findByName('FREE');

      expect(result).toEqual(plan);
      expect(mockCtx.prisma.plan.findFirst).toHaveBeenCalledWith({ where: { name: 'FREE' } });
    });

    it('should return null when plan not found', async () => {
      const repo = new PlanRepository(ctx.prisma);
      mockCtx.prisma.plan.findFirst.mockResolvedValue(null);

      const result = await repo.findByName('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return plan when found', async () => {
      const repo = new PlanRepository(ctx.prisma);
      const plan = { id: 'plan-id', name: 'FREE', monthlyLinkLimit: 10, createdAt: new Date(), updatedAt: new Date() };
      mockCtx.prisma.plan.findUnique.mockResolvedValue(plan as any);

      const result = await repo.findById('plan-id');

      expect(result).toEqual(plan);
      expect(mockCtx.prisma.plan.findUnique).toHaveBeenCalledWith({ where: { id: 'plan-id' } });
    });

    it('should return null when plan not found', async () => {
      const repo = new PlanRepository(ctx.prisma);
      mockCtx.prisma.plan.findUnique.mockResolvedValue(null);

      const result = await repo.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
