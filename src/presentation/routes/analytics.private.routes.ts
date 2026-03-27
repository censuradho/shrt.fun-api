import { authMiddleware } from '@/presentation/middleware/auth.middleware';
import { offsetPaginationQueriesDto } from '@/presentation/dtos/paginationQueries.dto';
import { FastifyInstance } from 'fastify';
import z from 'zod';
import { makeAnalyticsController } from '../modules/analytics.module';

const urlParamsDto = z.object({ urlId: z.string() });

export async function analyticsRoutesPrivate(app: FastifyInstance) {
  const analyticsController = makeAnalyticsController();

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
