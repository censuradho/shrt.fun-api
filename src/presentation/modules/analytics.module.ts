import { FindLocationAnalyticsQuery } from '@/application/queries/findLocationAnalytics.query';
import { prisma } from '@/infra/database/prisma';
import { HitRepository } from '@/infra/repositories/hit/HitRepository';
import { UrlRepository } from '@/infra/repositories/url/UrlRepository.prisma';
import { AnalyticsController } from '../controller/analytics.controller';

const urlRepository = new UrlRepository(prisma);
const hitRepository = new HitRepository(prisma);

export function makeAnalyticsController(): AnalyticsController {
  const findLocationAnalyticsQuery = new FindLocationAnalyticsQuery(urlRepository, hitRepository);
  return new AnalyticsController(findLocationAnalyticsQuery);
}
