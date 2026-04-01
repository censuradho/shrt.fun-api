import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockContext, Context, createMockContext } from '@/tests/prismaContext';
import { UrlUnitOfWork } from '@/infra/repositories/url/UrlUnitOfWork';

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

describe('UrlUnitOfWork', () => {
  it('should execute work inside a transaction and return result', async () => {
    mockCtx.prisma.$transaction.mockImplementation(async (fn: any) => fn(mockCtx.prisma));
    const uow = new UrlUnitOfWork(ctx.prisma);

    const result = await uow.run(async ({ url, hit }) => {
      expect(url).toBeDefined();
      expect(hit).toBeDefined();
      return 'done';
    });

    expect(result).toBe('done');
    expect(mockCtx.prisma.$transaction).toHaveBeenCalled();
  });

  it('should propagate errors thrown inside the transaction', async () => {
    mockCtx.prisma.$transaction.mockImplementation(async (fn: any) => fn(mockCtx.prisma));
    const uow = new UrlUnitOfWork(ctx.prisma);

    await expect(
      uow.run(async () => {
        throw new Error('tx failed');
      }),
    ).rejects.toThrow('tx failed');
  });
});
