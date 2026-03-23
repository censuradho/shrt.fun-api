export interface CacheGateway {
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  getAll<T = unknown>(pattern?: string): Promise<{ key: string; value: T }[]>
}