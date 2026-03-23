import { CacheGateway } from "@/domain/interfaces/CacheGateway";
import { Redis } from "ioredis";

export class RedisCacheGateway implements CacheGateway {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) as T : null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.set(
        key,
        JSON.stringify(value),
        "EX",
        ttlSeconds
      );
    } else {
      await this.redis.set(key, JSON.stringify(value));
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async getAll<T>(pattern = '*'): Promise<{ key: string; value: T }[]> {
    const keys = await this.redis.keys(pattern);
    if (keys.length === 0) return [];

    const values = await this.redis.mget(...keys);
    return keys
      .map((key, i) => ({ key, value: values[i] ? JSON.parse(values[i] ?? 'null') as T : null }))
      .filter((entry): entry is { key: string; value: T } => entry.value !== null);
  }
}