import 'fastify'
import Redis from "ioredis";
declare module 'fastify' {

  interface FastifyRequest {
    user: {
      id: string;
      email?: string
    };
  }
  
  interface FastifyInstance {
    redis: Redis;
  }
}

