import 'dotenv/config';
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";

import { 
  ZodTypeProvider, 
  validatorCompiler, 
  serializerCompiler, 
} from "fastify-type-provider-zod";

import { corsConfig } from './infra/config/cors';
import { redisPlugin } from './infra/http/plugins/redis';

import { urlRoutes } from './presentation/routes/url.routes';

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

app.register(fastifyCors, corsConfig)
app.register(redisPlugin)

app.register(urlRoutes, { prefix: '/v1' });

export { app }