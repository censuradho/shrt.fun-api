import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import 'dotenv/config';
import Fastify from 'fastify';
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

import { corsConfig } from '@/infra/config/cors';
import { envProvider } from '@/infra/config/ProcessEnvProvider';
import { rateLimitConfig } from '@/infra/config/rateLimit';
import { redisPlugin } from '@/infra/http/plugins/redis';
import { analyticsModule } from '@/modules/analytics';
import { authModule } from '@/modules/auth';
import { linkModule, linkPublicModule } from '@/modules/link';
import { userModule } from '@/modules/user/plugin';
import { HTTP_ERROR_CODES } from '@/shared/constants/httpStatusCodes';
import { errorHandler } from './error-handler';

const app = Fastify({
  trustProxy: true,
  logger: envProvider.get('NODE_ENV') !== 'production'
    ? {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }
    : true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler);

app.register(fastifyCors, corsConfig);
app.register(redisPlugin);

app.register(fastifyRateLimit, rateLimitConfig).after(() => {
  app.setNotFoundHandler(
    {
      preHandler: app.rateLimit({
        max: 4,
        timeWindow: 500,
      }),
    },
    function (request, reply) {
      request.log.warn({ method: request.method, url: request.url }, 'Route not found');
      reply.status(HTTP_ERROR_CODES.NOT_FOUND).send({ error: 'Route not found' });
    },
  );
});

app.register(linkPublicModule);
app.register(authModule, { prefix: '/v1' });
app.register(linkModule, { prefix: '/v1' });
app.register(analyticsModule, { prefix: '/v1' });
app.register(userModule, { prefix: '/v1' });
app.get('/v1/health', async () => ({ status: 'ok' }));

export { app };
