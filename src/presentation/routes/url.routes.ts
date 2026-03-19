import { FastifyInstance } from 'fastify';
import { makeUrlController } from '../modules/url.module';
import { createUrlDto } from '../dtos/url/createUrl.dto';

export async function urlRoutes(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.post(
    '/url', 
    {
      schema: {
        body: createUrlDto
      },
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute'
        }
      }
    },
    urlController.create.bind(urlController)
  );

  app.get(
    '/:slug',
    urlController.redirect.bind(urlController)
  );
}
