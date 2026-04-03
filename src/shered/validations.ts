const BANNED_SLUGS = [
  // conflitos com rotas da API
  'qr', 'v1', 'auth', 'url', 'analytics', 'health', 'stats', 'static', 'api',
  // área administrativa / auth
  'admin', 'login', 'logout', 'signup', 'register', 'dashboard',
  // arquivos padrão
  'favicon.ico', 'robots.txt', 'sitemap.xml',
  // subdomínios comuns
  'www', 'mail', 'ftp', 'cdn', 'assets',
  // páginas institucionais
  'support', 'help', 'about', 'terms', 'privacy', 'contact',
  // páginas de erro
  '404', '500', 'error',
  // valores que causam bugs em parsers
  'null', 'undefined',
  // RFC 5785
  'well-known',
] as const

export function slugValidation (slug: string): boolean {
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