import 'dotenv/config';
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";

import { 
  ZodTypeProvider, 
  validatorCompiler, 
  serializerCompiler, 
} from "fastify-type-provider-zod";

import { corsConfig } from './infra/config/cors';
import { redisPlugin } from './infra/http/plugins/redis';

import { urlRoutes } from './presentation/routes/url.routes';
import { rateLimitConfig } from './infra/config/rateLimit';
import { HTTP_ERROR_CODES } from './shered/httpStatusCodes';
import { errorHandler } from './presentation/middleware/error-handler';

const app = Fastify({
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
  }, function (_, reply) {
    reply.status(HTTP_ERROR_CODES.NOT_FOUND).send({ error: 'Route not found' });
  })
})

app.register(urlRoutes, { prefix: '/v1' });

export { app }