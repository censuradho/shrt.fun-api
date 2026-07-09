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
import {
  createAnonymousShortUrlResponseDto,
  createShortUrlResponseDto,
  findManyLinksPaginatedResponseDto,
  publicStatsResponseDto,
  qrCodeResponseDto,
  toggleUrlActiveResponseDto,
  urlModelResponseDto,
} from '../application/dtos/url-response.dto';

const urlParamsDto = z.object({ id: z.string() });

export async function registerLinkPublicRoutes(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.get(
    '/:slug',
    { schema: { tags: ['Redirect'], summary: 'Redireciona para a URL original a partir do slug' } },
    urlController.redirect.bind(urlController),
  );

  app.get(
    '/qr/:slug',
    { schema: { tags: ['Redirect'], summary: 'Redireciona para a URL original a partir da leitura do QR Code' } },
    urlController.redirectQr.bind(urlController),
  );
}

export async function registerLinkRoutes(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.post(
    '/anonymous',
    {
      schema: {
        tags: ['Links'],
        summary: 'Cria um link encurtado sem autenticação (limite de 1 por hora)',
        body: createUrlDto,
        response: { 201: createAnonymousShortUrlResponseDto },
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
        tags: ['Links'],
        summary: 'Lista os links do usuário autenticado (paginado)',
        security: [{ bearerAuth: [] }],
        querystring: findManyLinksFiltersDto,
        response: { 200: findManyLinksPaginatedResponseDto },
      },
    },
    urlController.findManyPaginated.bind(urlController),
  );

  app.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Links'],
        summary: 'Busca um link pelo id',
        security: [{ bearerAuth: [] }],
        params: urlParamsDto,
        response: { 200: urlModelResponseDto },
      },
    },
    urlController.findById.bind(urlController),
  );

  app.patch(
    '/:id/active',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Links'],
        summary: 'Ativa ou desativa um link',
        security: [{ bearerAuth: [] }],
        params: urlParamsDto,
        response: { 200: toggleUrlActiveResponseDto },
      },
    },
    urlController.toggleActive.bind(urlController),
  );

  app.post(
    '/',
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ['Links'],
        summary: 'Cria um link encurtado para o usuário autenticado',
        security: [{ bearerAuth: [] }],
        body: createUrlDto,
        response: { 201: createShortUrlResponseDto },
      },
    },
    urlController.create.bind(urlController),
  );

  app.put(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Links'],
        summary: 'Atualiza um link existente',
        security: [{ bearerAuth: [] }],
        params: urlParamsDto,
        body: updateUrlDto,
      },
    },
    urlController.update.bind(urlController),
  );

  app.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Links'],
        summary: 'Remove um link',
        security: [{ bearerAuth: [] }],
        params: urlParamsDto,
      },
    },
    urlController.delete.bind(urlController),
  );

  app.get(
    '/:id/qrcode',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Links'],
        summary: 'Obtém o QR Code de um link',
        security: [{ bearerAuth: [] }],
        params: urlParamsDto,
        response: { 200: qrCodeResponseDto },
      },
    },
    urlController.getLinkQRCode.bind(urlController),
  );

  app.patch(
    '/:id/qrcode',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Links'],
        summary: 'Atualiza as opções de customização do QR Code de um link',
        security: [{ bearerAuth: [] }],
        params: urlParamsDto,
        body: qrOptionsDto,
      },
    },
    urlController.updateQrCodeOptions.bind(urlController),
  );

  app.post(
    '/qrcode/preview',
    {
      preHandler: authMiddleware,
      schema: {
        tags: ['Links'],
        summary: 'Gera uma prévia do QR Code sem persistir alterações',
        security: [{ bearerAuth: [] }],
        body: qrOptionsDto,
        response: { 200: qrCodeResponseDto },
      },
    },
    urlController.previewQrCode.bind(urlController),
  );
}

export async function registerLinkStatsRoute(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.get(
    '/stats',
    {
      schema: {
        tags: ['Links'],
        summary: 'Estatísticas públicas agregadas de links',
        response: { 200: publicStatsResponseDto },
      },
    },
    urlController.publicStats.bind(urlController),
  );
}
