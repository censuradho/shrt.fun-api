export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove caracteres especiais
    .replace(/\s+/g, '-')     // substitui espaços por hífen
    .replace(/-+/g, '-');     // remove múltiplos hífens
}