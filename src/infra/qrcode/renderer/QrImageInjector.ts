const CENTER_LOGO_RATIO = 0.2
const WATERMARK_SIZE = 64
const WATERMARK_MARGIN = 6
const WATERMARK_PADDING = 4

export class QrImageInjector {
  centerLogoElement(logo: string, svgSize: number): string {
    const logoSize = svgSize * CENTER_LOGO_RATIO
    const pos = (svgSize - logoSize) / 2

    return `<image href="${logo}" xlink:href="${logo}" x="${pos}" y="${pos}" width="${logoSize}" height="${logoSize}"/>`
  }

  watermarkElement(logo: string, svgSize: number, backgroundColor: string): string {
    const bgSize = WATERMARK_SIZE + WATERMARK_PADDING * 2
    const bgX = svgSize - bgSize - WATERMARK_MARGIN
    const bgY = svgSize - bgSize - WATERMARK_MARGIN
    const imgX = bgX + WATERMARK_PADDING
    const imgY = bgY + WATERMARK_PADDING

    const bg = `<rect x="${bgX}" y="${bgY}" width="${bgSize}" height="${bgSize}" fill="${backgroundColor}" rx="4"/>`
    const img = `<image href="${logo}" xlink:href="${logo}" x="${imgX}" y="${imgY}" width="${WATERMARK_SIZE}" height="${WATERMARK_SIZE}" preserveAspectRatio="xMidYMid meet"/>`

    return bg + img
  }
}
