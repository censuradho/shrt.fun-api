import { describe, it, expect, beforeEach } from 'vitest';
import { MockContext, Context, createMockContext } from '../../../prismaContext';
import { HitRepository } from '@/infra/repositories/hit/HitRepository';
import { CreateHitEntityDto } from '@/domain/repositories/dtos/CreateHitEntity.dto';

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

describe('HitRepository', () => {
  describe('incrementHitCount', () => {
    it('should create a hit record with the given payload', async () => {
      const repo = new HitRepository(ctx.prisma);
      const payload: CreateHitEntityDto= {
        id: 'hit-id',
        urlId: 'url-id',
        ipAddress: '192.168.0.1',
        userAgent: 'Mozilla/5.0',
        source: 'url',
      };

      mockCtx.prisma.hit.create.mockResolvedValue({} as any);

      await repo.incrementHitCount(payload);

      expect(mockCtx.prisma.hit.create).toHaveBeenCalledWith({
        data: {
          id: payload.id,
          urlId: payload.urlId,
          ipAddress: payload.ipAddress,
          userAgent: payload.userAgent,
          source: payload.source,
        },
      });
    });
  });
});
