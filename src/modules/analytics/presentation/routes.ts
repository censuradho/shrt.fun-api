import { makeAnalyticsController } from './factories/makeAnalyticsController';
import { authMiddleware } from '@/modules/auth/presentation/middlewares/auth.middleware';
import { offsetPaginationQueriesDto } from '@/shared/types/pagination-queries.dto';
import { FastifyInstance } from 'fastify';
import z from 'zod';
import { topMostAccessedUrlsQueryDto, TopMostAccessedUrlsQueryDto } from './schemas/analytics.schema';

const urlParamsDto = z.object({ urlId: z.string() });

export async function registerAnalyticsRoutes(app: FastifyInstance) {
  const analyticsController = makeAnalyticsController();

  app.get<{ Querystring: TopMostAccessedUrlsQueryDto }>(
    '/url/ranking',
    {
      preHandler: authMiddleware,
      schema: { querystring: topMostAccessedUrlsQueryDto },
    },
    analyticsController.topMostAccessedUrls.bind(analyticsController),
  );

  app.get<{ Querystring: TopMostAccessedUrlsQueryDto }>(
    '/url/ranking/details',
    {
      preHandler: authMiddleware,
      schema: { querystring: topMostAccessedUrlsQueryDto },
    },
    analyticsController.topMostAccessedUrlsDetail.bind(analyticsController),
  );

  app.get(
    '/url/referrer-distribution',
    {
      preHandler: authMiddleware,
    },
    analyticsController.referrerDistribution.bind(analyticsController),
  );

  app.get(
    '/locations/hits/url/:urlId/',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    analyticsController.findLocations.bind(analyticsController),
  );

  app.get(
    '/locations/hits/countries',
    {
      preHandler: authMiddleware,
      schema: { querystring: offsetPaginationQueriesDto },
    },
    analyticsController.findCountriesByUserId.bind(analyticsController),
  );

  app.get(
    '/locations/hits/cities',
    {
      preHandler: authMiddleware,
      schema: { querystring: offsetPaginationQueriesDto },
    },
    analyticsController.findCitiesByUserId.bind(analyticsController),
  );
}
