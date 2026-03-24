import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import 'dotenv/config';
import Fastify from "fastify";

import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'

import { corsConfig } from './infra/config/cors';
import { redisPlugin } from './infra/http/plugins/redis';

import { rateLimitConfig } from './infra/config/rateLimit';
import { errorHandler } from './presentation/middleware/error-handler';
import { urlRoutesPublic } from './presentation/routes/url.routes';
import { HTTP_ERROR_CODES } from './shered/httpStatusCodes';
import { routes } from "./presentation/routes/routes";
import { envProvider } from "./infra/config/ProcessEnvProvider";

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

app.register(fastifyCookie, {
  secret: envProvider.get('COOKIE_SECRET') as string,
})

app.register(fastifyJwt, {
  secret: envProvider.get('SUPABASE_LEGACY_JWT_SECRET') as string
})


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

app.register(urlRoutesPublic);
app.register(routes, { prefix: '/v1' });

export { app };
