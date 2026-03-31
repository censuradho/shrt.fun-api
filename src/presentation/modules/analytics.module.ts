import { FindCityAnalyticsByUserQuery } from './../../application/queries/findLocationAnalyticsByUser.query';
import { FindCountryAnalyticsByUserQuery } from './../../application/queries/findCountryAnalyticsByUser.query';
import { FindLocationAnalyticsQuery } from '@/application/queries/findLocationAnalytics.query';
import { prisma } from '@/infra/database/prisma';
import { HitRepository } from '@/infra/repositories/hit/HitRepository';
import { UrlRepository } from '@/infra/repositories/url/UrlRepository.prisma';
import { AnalyticsController } from '../controller/analytics.controller';
import { AnalyticsRepository } from '@/infra/repositories/analytics/AnalyticsRepository.prisma';

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
    analyticsRepository
  );
}
