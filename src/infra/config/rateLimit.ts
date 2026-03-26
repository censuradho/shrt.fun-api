import { RateLimitPluginOptions } from "@fastify/rate-limit";
import { envProvider } from "./ProcessEnvProvider";

export const rateLimitConfig: RateLimitPluginOptions = {
  max: 100,
  timeWindow: '1 minute',
  global: true,
  ban: 2,
  nameSpace: 'rate-limiter',
  ...(envProvider.get('NODE_ENV') === 'development' && ({
    allowList: ['127.0.0.1'],
    ban: undefined,
  })),
}