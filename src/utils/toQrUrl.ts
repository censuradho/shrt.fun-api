/**
 * Transforms a short URL into its QR redirect equivalent.
 * e.g. https://shrt.fun/abc123 → https://shrt.fun/qr/abc123
 */
export function toQrUrl(shortUrl: string): string {
  const url = new URL(shortUrl)
  return `${url.origin}/qr${url.pathname}`
}
