import { FastifyInstance } from 'fastify';
import { makeUrlController } from '../modules/url.module';

export async function urlRoutes(app: FastifyInstance) {
  const urlController = makeUrlController(app);

  app.post('/url', urlController.create.bind(urlController));
}
