import { CacheGateway } from '@/domain/CacheGateway';
import { IHitRepository } from '@/modules/link/domain/repositories/IHitRepository';
import { IUrlRepository } from '@/modules/link/domain/repositories/IUrlRepository';
import { CacheKeyBuilder } from '@/shared/kernel/CacheKeyBuilder';

const STATS_TTL = 60 * 60 * 24; // 24h

export class PublicStatsQuery {
  constructor(
    private readonly cache: CacheGateway,
    private readonly urlRepository: IUrlRepository,
    private readonly hitRepository: IHitRepository,
  ) {}

  async execute(): Promise<{ totalUrls: number; totalClicks: number }> {
    const [cachedUrls, cachedClicks] = await Promise.all([
      this.cache.get<number>(CacheKeyBuilder.totalUrl()),
      this.cache.get<number>(CacheKeyBuilder.totalClicks()),
    ]);

    const [totalUrls, totalClicks] = await Promise.all([
      cachedUrls !== null
        ? Promise.resolve(cachedUrls)
        : this.urlRepository.countAll().then(count => {
          this.cache.set(CacheKeyBuilder.totalUrl(), count, STATS_TTL);
          return count;
        }),
      cachedClicks !== null
        ? Promise.resolve(cachedClicks)
        : this.hitRepository.countAll().then(count => {
          this.cache.set(CacheKeyBuilder.totalClicks(), count, STATS_TTL);
          return count;
        }),
    ]);

    return { totalUrls, totalClicks };
  }
}
