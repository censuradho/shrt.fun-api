/**
 * Calculates the maximum base64 string length for a given file size in bytes.
 * Base64 encoding increases size by ~33% (4 chars per 3 bytes).
 */
export function base64MaxSize(bytes: number): number {
  return Math.ceil(bytes * (4 / 3))
}
