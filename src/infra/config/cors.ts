import { FastifyCorsOptions } from "@fastify/cors";
import { envProvider } from "./ProcessEnvProvider";

const origins = envProvider.get('CORS')?.split(',').map(origin => origin.trim()) || [];

export const corsConfig: FastifyCorsOptions = {
  origin: origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}
