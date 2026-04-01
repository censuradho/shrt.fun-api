import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RedisCacheGateway } from '@/infra/cache/RedisCacheGateway';

const makeRedis = () => ({
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
});

beforeEach(() => vi.clearAllMocks());

describe('RedisCacheGateway', () => {
  describe('get', () => {
    it('should return parsed value from redis', async () => {
      const redis = makeRedis();
      vi.mocked(redis.get).mockResolvedValue(JSON.stringify({ foo: 'bar' }));
      const gateway = new RedisCacheGateway(redis as any);

      const result = await gateway.get('key');

      expect(result).toEqual({ foo: 'bar' });
      expect(redis.get).toHaveBeenCalledWith('key');
    });

    it('should return null when key does not exist', async () => {
      const redis = makeRedis();
      const gateway = new RedisCacheGateway(redis as any);

      const result = await gateway.get('key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with TTL when provided', async () => {
      const redis = makeRedis();
      const gateway = new RedisCacheGateway(redis as any);

      await gateway.set('key', { foo: 'bar' }, 3600);

      expect(redis.set).toHaveBeenCalledWith('key', JSON.stringify({ foo: 'bar' }), 'EX', 3600);
    });

    it('should set value without TTL when not provided', async () => {
      const redis = makeRedis();
      const gateway = new RedisCacheGateway(redis as any);

      await gateway.set('key', { foo: 'bar' });

      expect(redis.set).toHaveBeenCalledWith('key', JSON.stringify({ foo: 'bar' }));
    });
  });

  describe('delete', () => {
    it('should delete key from redis', async () => {
      const redis = makeRedis();
      const gateway = new RedisCacheGateway(redis as any);

      await gateway.delete('key');

      expect(redis.del).toHaveBeenCalledWith('key');
    });
  });
});
