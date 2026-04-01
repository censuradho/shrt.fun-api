import { authMiddleware } from '@/presentation/middleware/auth.middleware';
import { offsetPaginationQueriesDto } from '@/presentation/dtos/paginationQueries.dto';
import { FastifyInstance } from 'fastify';
import z from 'zod';
import { makeAnalyticsController } from '../modules/analytics.module';
import { topMostAccessedUrlsQueryDto, TopMostAccessedUrlsQueryDto } from '../dtos/analytics.dto';

const urlParamsDto = z.object({ urlId: z.string() });

export async function analyticsRoutesPrivate(app: FastifyInstance) {
  const analyticsController = makeAnalyticsController();

  app.get<{ Querystring: TopMostAccessedUrlsQueryDto }>(
    '/url/ranking',
    {
      preHandler: authMiddleware,
      schema: { querystring: topMostAccessedUrlsQueryDto },
    },
    analyticsController.topMostAccessedUrls.bind(analyticsController)
  )

  app.get<{ Querystring: TopMostAccessedUrlsQueryDto }>(
    '/url/ranking/details',
    {
      preHandler: authMiddleware,
      schema: { querystring: topMostAccessedUrlsQueryDto },
    },
    analyticsController.topMostAccessedUrlsDetail.bind(analyticsController)
  )

  app.get(
    '/locations/hits/url/:urlId/',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    analyticsController.findLocations.bind(analyticsController)
  );

  app.get(
    '/locations/hits/countries',
    {
      preHandler: authMiddleware,
      schema: { querystring: offsetPaginationQueriesDto },
    },
    analyticsController.findCountriesByUserId.bind(analyticsController)
  );

  app.get(
    '/locations/hits/cities',
    {
      preHandler: authMiddleware,
      schema: { querystring: offsetPaginationQueriesDto },
    },
    analyticsController.findCitiesByUserId.bind(analyticsController)
  );
}
