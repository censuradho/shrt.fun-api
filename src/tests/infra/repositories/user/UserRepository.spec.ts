import { describe, it, expect, beforeEach } from 'vitest';
import { MockContext, Context, createMockContext } from '@/tests/prismaContext';
import { UserRepository } from '@/modules/user/infra/repositories/UserRepository.prisma';

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

describe('UserRepository', () => {
  describe('findUserBySupabaseId', () => {
    it('should return mapped user when found', async () => {
      const repo = new UserRepository(ctx.prisma);
      const dbUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: '@john_123',
        isActive: true,
        createdAt: new Date(),
        supabaseId: 'sb-id',
        plan: { id: 'plan-id', name: 'FREE', monthlyLinkLimit: 10 },
      };
      mockCtx.prisma.user.findUnique.mockResolvedValue(dbUser as any);

      const result = await repo.findUserBySupabaseId('sb-id');

      expect(result).toMatchObject({
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        plan: { id: 'plan-id', name: 'FREE', monthlyLinkLimit: 10 },
      });
      expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { 
          supabaseId: 'sb-id' 
        },
        include: { 
          plan: { 
            select: { 
              id: true, 
              name: true, 
              monthlyLinkLimit: true,
              monthlyQrCodeLimit: true,
            } 
          } 
        },
      });
    });

    it('should return null when user not found', async () => {
      const repo = new UserRepository(ctx.prisma);
      mockCtx.prisma.user.findUnique.mockResolvedValue(null);

      const result = await repo.findUserBySupabaseId('sb-id');

      expect(result).toBeNull();
    });
  });

  describe('checkIfExistsByEmail', () => {
    it('should return true when user exists', async () => {
      const repo = new UserRepository(ctx.prisma);
      mockCtx.prisma.user.count.mockResolvedValue(1);

      const result = await repo.checkIfExistsByEmail('test@example.com');

      expect(result).toBe(true);
      expect(mockCtx.prisma.user.count).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return false when user does not exist', async () => {
      const repo = new UserRepository(ctx.prisma);
      mockCtx.prisma.user.count.mockResolvedValue(0);

      const result = await repo.checkIfExistsByEmail('test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should create user and return id', async () => {
      const repo = new UserRepository(ctx.prisma);
      mockCtx.prisma.user.create.mockResolvedValue({ id: 'new-user-id' } as any);

      const result = await repo.create({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        supabaseId: 'sb-id',
        planId: 'plan-id',
      });

      expect(result).toBe('new-user-id');
      expect(mockCtx.prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            supabaseId: 'sb-id',
            planId: 'plan-id',
          }),
          select: { id: true },
        }),
      );
    });
  });
});
