export function sanitizeString(value?: string): string | undefined {
  if (typeof value !== "string") return;
  // Remove caracteres perigosos e comandos SQL comuns
  return value
    .replace(/['";\\]/g, "")         // Remove aspas, ponto e vírgula, barra invertida
    .replace(/(--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC)\b)/gi, "") // Remove comandos SQL
    .trim();
}