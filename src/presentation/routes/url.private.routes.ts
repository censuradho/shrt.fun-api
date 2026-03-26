import { FastifyInstance } from 'fastify';
import { makeUrlController } from '../modules/url.module';
import { authMiddleware } from '../middleware/auth.middleware';
import { findManyLinksFiltersDto } from '../dtos/url/findManyLinksQueries.dto';
import { createUrlDto } from '../dtos/url/createUrl.dto';
import z from 'zod';

const urlParamsDto = z.object({ id: z.string() });

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

  app.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    urlController.findById.bind(urlController)
  );

  app.patch(
    '/:id/active',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    urlController.toggleActive.bind(urlController)
  );

  app.post(
    '/',
    {
      preHandler: [authMiddleware],
      schema: {
        body: createUrlDto
      }
    },
    urlController.create.bind(urlController)
  );
}
