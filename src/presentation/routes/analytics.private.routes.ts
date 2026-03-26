import { authMiddleware } from '@/presentation/middleware/auth.middleware';
import { FastifyInstance } from 'fastify';
import z from 'zod';
import { makeAnalyticsController } from '../modules/analytics.module';

const urlParamsDto = z.object({ urlId: z.string() });

export async function analyticsRoutesPrivate(app: FastifyInstance) {
  const analyticsController = makeAnalyticsController();

  app.get(
    '/hits/url/:urlId/locations',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    analyticsController.findLocations.bind(analyticsController)
  );
}
