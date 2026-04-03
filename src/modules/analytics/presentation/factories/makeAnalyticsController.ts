import { FindCountryAnalyticsByUserQuery } from '@/modules/analytics/application/queries/findCountryAnalyticsByUser.query';
import { FindLocationAnalyticsQuery } from '@/modules/analytics/application/queries/findLocationAnalytics.query';
import { FindCityAnalyticsByUserQuery } from '@/modules/analytics/application/queries/findLocationAnalyticsByUser.query';
import { AnalyticsRepository } from '@/modules/analytics/infra/repositories/AnalyticsRepository.prisma';
import { AnalyticsController } from '@/modules/analytics/presentation/controllers/analytics.controller';
import { HitRepository } from '@/modules/link/infra/repositories/HitRepository';
import { UrlRepository } from '@/modules/link/infra/repositories/UrlRepository.prisma';
import { prisma } from '@/infra/database/prisma';

const urlRepository = new UrlRepository(prisma);
const hitRepository = new HitRepository(prisma);
const analyticsRepository = new AnalyticsRepository(prisma);

export function makeAnalyticsController(): AnalyticsController {
  const findLocationAnalyticsQuery = new FindLocationAnalyticsQuery(urlRepository, hitRepository);
  const findCountryAnalyticsByUserQuery = new FindCountryAnalyticsByUserQuery(hitRepository);
  const findCityAnalyticsByUserQuery = new FindCityAnalyticsByUserQuery(hitRepository);

  return new AnalyticsController(
    findLocationAnalyticsQuery,
    findCountryAnalyticsByUserQuery,
    findCityAnalyticsByUserQuery,
    analyticsRepository,
  );
}
