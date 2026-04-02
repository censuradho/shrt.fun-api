import { FastifyInstance } from 'fastify';
import { makeUrlController } from '../modules/url.module';
import { authMiddleware } from '../middleware/auth.middleware';
import { findManyLinksFiltersDto } from '../dtos/url/findManyLinksQueries.dto';
import { createUrlDto, qrOptionsDto } from '../dtos/url/createUrl.dto';
import z from 'zod';
import { AppError } from '@/domain/errors/AppError';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { HTTP_STATUS_CODES } from '@/shered/httpStatusCodes';

const urlParamsDto = z.object({ id: z.string() });

export async function urlRoutesPrivate(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.post(
    '/anonymous', 
    {
      schema: {
        body: createUrlDto
      },
      config: {
        rateLimit: {
          max: 1,
          timeWindow: '1 hour',
          errorResponseBuilder: () => {
            throw new AppError(URL_ERRORS.ONLY_1_URL_CREATIONS_PER_DAY, {
              status: HTTP_STATUS_CODES.TOO_MANY_REQUESTS
            })
          }
        },
      }
    },
    urlController.createAnonymous.bind(urlController)
  );

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

  app.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    urlController.delete.bind(urlController)
  );

  app.post(
    '/qrcode/preview',
    {
      preHandler: authMiddleware,
      schema: { body: qrOptionsDto },
    },
    urlController.previewQrCode.bind(urlController)
  );
}
