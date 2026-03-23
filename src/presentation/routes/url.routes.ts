import { FastifyInstance } from 'fastify';
import { makeUrlController } from '../modules/url.module';
import { createUrlDto } from '../dtos/url/createUrl.dto';
import { URL_ERRORS } from '@/domain/errors/url.error';
import { AppError } from '@/domain/errors/AppError';
import { HTTP_STATUS_CODES } from '@/shered/httpStatusCodes';

export async function urlRoutesPublic(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.post(
    '/url', 
    {
      schema: {
        body: createUrlDto
      },
      config: {
        rateLimit: {
          max: 2,
          timeWindow: '1 hour',
          errorResponseBuilder: () => {
            throw new AppError(URL_ERRORS.ONLY_2_URL_CREATIONS_PER_HOUR, {
              status: HTTP_STATUS_CODES.TOO_MANY_REQUESTS
            })
          }
        },
      }
    },
    urlController.create.bind(urlController)
  );

  app.get(
    '/:slug',
    urlController.redirect.bind(urlController)
  );
}
