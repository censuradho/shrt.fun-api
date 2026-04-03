import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import 'dotenv/config';
import Fastify from "fastify";

import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { corsConfig } from './infra/config/cors';
import { redisPlugin } from './infra/http/plugins/redis';

import { rateLimitConfig } from './infra/config/rateLimit';
import { errorHandler } from './presentation/middleware/error-handler';
import { urlRoutesPublic } from './presentation/routes/url.routes';
import { HTTP_ERROR_CODES } from './shared/httpStatusCodes';
import { routes } from "./presentation/routes/routes";

const app = Fastify({
  trustProxy: true,
  logger: process.env.NODE_ENV !== 'production' ? ({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }) : true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.setErrorHandler(errorHandler);


app.register(fastifyCors, corsConfig)
app.register(redisPlugin)

app.register(fastifyRateLimit, rateLimitConfig).after(() => {
  app.setNotFoundHandler({
    preHandler: app.rateLimit({
      max: 4,
      timeWindow: 500
    })
  }, function (request, reply) {
    request.log.warn({ method: request.method, url: request.url }, 'Route not found');
    reply.status(HTTP_ERROR_CODES.NOT_FOUND).send({ error: 'Route not found' });
  })
})

app.register(urlRoutesPublic);
app.register(routes, { prefix: '/v1' });

export { app };
