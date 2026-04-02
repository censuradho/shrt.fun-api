import { FastifyInstance } from 'fastify';
import { makeUrlController } from '../modules/url.module';

export async function urlRoutesPublic(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.get(
    '/:slug',
    urlController.redirect.bind(urlController)
  );

  app.get(
    '/qr/:slug',
    urlController.redirectQr.bind(urlController)
  );
}
