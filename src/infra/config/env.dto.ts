import 'dotenv/config';
import { z } from 'zod';

const NUMBER_AS_STRING = /^\d+$/;

export const EnvDto = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  PORT: z.string().regex(NUMBER_AS_STRING, 'PORT must be a number').optional(),
  COOKIE_SECRET: z.string().min(1, 'COOKIE_SECRET is required'),
  CORS: z.string().min(1, 'CORS is required'),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required'),
  CLOUDFLARE_API_TOKEN: z.string().min(1, 'CLOUDFLARE_API_TOKEN is required'),
  CLOUDFLARE_IMAGE_URL: z.string().min(1, 'CLOUDFLARE_IMAGE_URL is required'),
  REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
  REDIS_PORT: z.string().regex(NUMBER_AS_STRING, 'REDIS_PORT must be a number'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL is required'),
  BREVO_SMTP_HOST: z.string().min(1, 'BREVO_SMTP_HOST is required'),
  BREVO_SMTP_PORT: z.string().regex(NUMBER_AS_STRING, 'BREVO_SMTP_PORT must be a number'),
  BREVO_SMTP_USER: z.string().min(1, 'BREVO_SMTP_USER is required'),
  BREVO_SMTP_KEY: z.string().min(1, 'BREVO_SMTP_KEY is required'),
  BREVO_SMTP_SENDER: z.string().min(1, 'BREVO_SMTP_SENDER is required'),
  NOVA_BACKOFFICE_URL: z.string().min(1, 'NOVA_BACKOFFICE_URL is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DOMAIN_URL: z.string().min(1, 'DOMAIN_URL is required'),
  CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),
  REDIRECT_CLIENT_URL: z.string().min(1, 'REDIRECT_CLIENT_URL is required'),
});

export type EnvDto = z.infer<typeof EnvDto>;

let cachedEnv: EnvDto | null = null;

export function validateEnvOrThrow(): EnvDto {
  if (cachedEnv) return cachedEnv;

  const parsedEnv = EnvDto.safeParse(process.env);

  if (!parsedEnv.success) {
    const messages = parsedEnv.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment variables: ${messages}`);
  }

  cachedEnv = parsedEnv.data;
  return cachedEnv;
}

export const env = validateEnvOrThrow();