import fp from "fastify-plugin";
import Redis from "ioredis";
import { envProvider } from "@/infra/config/ProcessEnvProvider";

const createRedis = () => {
  const isDevelopment = envProvider.get('NODE_ENV') !== "production";

  if (isDevelopment) return new Redis({
    host: envProvider.get('REDIS_HOST'),
    port: Number(envProvider.get('REDIS_PORT')) || 6379,
  })

  const productionOption = envProvider.get('REDIS_URL') as string;

  return new Redis(productionOption);
}

export const redisPlugin = fp(async (fastify) => {
  const redis = createRedis();

  fastify.decorate("redis", redis);

  fastify.addHook("onClose", async () => {
    await redis.quit();
  });
});