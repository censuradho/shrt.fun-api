import 'fastify'
import Redis from "ioredis";
import { CookieUser } from '@/domain/interfaces/CookieUser';

declare module 'fastify' {
  interface FastifyRequest {
    localUser?: CookieUser
  }
  interface FastifyInstance {
    redis: Redis;
  }
}

