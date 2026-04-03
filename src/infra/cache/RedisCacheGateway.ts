import { CacheGateway } from "@/infra/domain/CacheGateway";
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
}