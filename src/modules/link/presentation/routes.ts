import { AppError } from '@/shared/errors/AppError';
import { URL_ERRORS } from '@/modules/link/domain/errors/url.error';
import { makeUrlController } from './factories/makeCreateLinkController';
import { authMiddleware } from '@/modules/auth/presentation/middlewares/auth.middleware';
import { HTTP_STATUS_CODES } from '@/shared/constants/httpStatusCodes';
import { FastifyInstance } from 'fastify';
import z from 'zod';
import { createUrlDto, qrOptionsDto } from './schemas/create-url.schema';
import { updateUrlDto } from '../application/dtos/update-url.dto';
import { findManyLinksFiltersDto } from './schemas/find-many-links.schema';

const urlParamsDto = z.object({ id: z.string() });

export async function registerLinkPublicRoutes(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.get('/:slug', urlController.redirect.bind(urlController));
  app.get('/qr/:slug', urlController.redirectQr.bind(urlController));
}

export async function registerLinkRoutes(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.post(
    '/anonymous',
    {
      schema: {
        body: createUrlDto,
      },
      config: {
        rateLimit: {
          max: 1,
          timeWindow: '1 hour',
          errorResponseBuilder: () => {
            throw new AppError(URL_ERRORS.ONLY_1_URL_CREATIONS_PER_DAY, {
              status: HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
            });
          },
        },
      },
    },
    urlController.createAnonymous.bind(urlController),
  );

  app.get(
    '/',
    {
      preHandler: authMiddleware,
      schema: {
        querystring: findManyLinksFiltersDto,
      },
    },
    urlController.findManyPaginated.bind(urlController),
  );

  app.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    urlController.findById.bind(urlController),
  );

  app.patch(
    '/:id/active',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    urlController.toggleActive.bind(urlController),
  );

  app.post(
    '/',
    {
      preHandler: [authMiddleware],
      schema: {
        body: createUrlDto,
      },
    },
    urlController.create.bind(urlController),
  );

  app.put(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto, body: updateUrlDto },
    },
    urlController.update.bind(urlController),
  );

  app.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    urlController.delete.bind(urlController),
  );

  app.get(
    '/:id/qrcode',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto },
    },
    urlController.getLinkQRCode.bind(urlController),
  );

  app.patch(
    '/:id/qrcode',
    {
      preHandler: authMiddleware,
      schema: { params: urlParamsDto, body: qrOptionsDto },
    },
    urlController.updateQrCodeOptions.bind(urlController),
  );

  app.post(
    '/qrcode/preview',
    {
      preHandler: authMiddleware,
      schema: { body: qrOptionsDto },
    },
    urlController.previewQrCode.bind(urlController),
  );
}

export async function registerLinkStatsRoute(app: FastifyInstance) {
  const urlController = makeUrlController(app);
  app.get('/stats', urlController.publicStats.bind(urlController));
}
