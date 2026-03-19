import fp from "fastify-plugin";
import Redis from "ioredis";

const createRedis = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment) return new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
  })

  const productionOption = process.env.REDIS_URL as string;

  return new Redis(productionOption);
}

export const redisPlugin = fp(async (fastify) => {
  const redis = createRedis();

  fastify.decorate("redis", redis);

  fastify.addHook("onClose", async () => {
    await redis.quit();
  });
});