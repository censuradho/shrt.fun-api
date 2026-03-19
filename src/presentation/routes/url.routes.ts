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
      }
    },  
    urlController.create.bind(urlController)
  );
}
