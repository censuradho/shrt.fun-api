import { FastifyInstance } from 'fastify';
import { makeUrlController } from '../modules/url.module';
import { authMiddleware } from '../middleware/auth.middleware';
import { findManyLinksFiltersDto } from '../dtos/url/findManyLinksQueries.dto';

export async function urlRoutesPrivate(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.get(
    '/',
    {
      preHandler: authMiddleware,
      schema: {
        querystring: findManyLinksFiltersDto,
      },
    },
    urlController.findManyPaginated.bind(urlController)
  );
}
