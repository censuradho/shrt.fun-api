export interface LocalEnvironmentVars {
  NODE_ENV?: 'development' | 'production' | 'test';
  PORT?: string;
  COOKIE_SECRET?: string;
  CORS?: string
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_IMAGE_URL?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_URL?: string;
  BREVO_SMTP_HOST?: string;
  BREVO_SMTP_PORT?: string;
  BREVO_SMTP_USER?: string;
  BREVO_SMTP_KEY?: string;
  BREVO_SMTP_SENDER?: string;
  NOVA_BACKOFFICE_URL?: string;
  DATABASE_URL?: string;
  DOMAIN_URL?: string;
  CLIENT_URL?: string;
  REDIRECT_CLIENT_URL?: string;
}

export interface IEnvProvider {
  get(key: keyof LocalEnvironmentVars): string | undefined;
}