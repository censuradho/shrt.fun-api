const BANNED_SLUGS = [
  // conflitos com rotas da API
  'api', 'apis', 'qr', 'url', 'analytics', 'health', 'stats', 'static',
  // versionamento de API
  'v1', 'v2', 'v3', 'v4', 'v5',
  // área administrativa
  'admin', 'administrator', 'root', 'system', 'sys', 'config', 'settings', 'pages', 'app', 'internal',
  // auth / sessão
  'auth', 'authentication', 'login', 'logout', 'signup', 'register',
  'oauth', 'sso', 'token', 'session', 'callback', 'verify', 'invite',
  'reset', 'reset-password', 'forgot-password', 'confirm',
  // dashboard / usuário
  'dashboard', 'me', 'home', 'index',
  'user', 'users', 'account', 'accounts', 'profile', 'profiles',
  // arquivos padrão
  'favicon.ico', 'robots.txt', 'sitemap.xml', 'manifest.json',
  'crossdomain.xml', 'service-worker.js',
  // subdomínios / infraestrutura comuns
  'www', 'mail', 'ftp', 'cdn', 'assets', 'internal', 'backend',
  'ws', 'socket', 'webhook', 'webhooks',
  // páginas institucionais
  'support', 'help', 'about', 'terms', 'privacy', 'contact', 'status',
  'blog', 'docs', 'documentation', 'faq', 'pricing',
  'careers', 'jobs', 'team', 'press', 'legal', 'cookies', 'news',
  // navegação / UI
  'search', 'explore', 'feed', 'notifications', 'inbox', 'messages', 'trending',
  // páginas de erro
  '404', '500', 'error',
  // valores que causam bugs em parsers
  'null', 'undefined',
  // RFC 5785
  'well-known',
  // ambientes
  'dev', 'staging', 'production', 'test',
  // alvos comuns de bots de segurança
  'wp-admin', 'wp-login', 'phpmyadmin', 'cgi-bin',
  // misc
  'xxx',
] as const

export function slugValidation (slug: string): boolean {
  if (slug && slug.length < 3) return false

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

export function slugNotBanned (slug: string): boolean {
  return !(BANNED_SLUGS as readonly string[]).includes(slug)
}

export function urlValidation (url: string): boolean {
  try {
    new URL(url)
    return true
  } catch  {
    return false
  }
}