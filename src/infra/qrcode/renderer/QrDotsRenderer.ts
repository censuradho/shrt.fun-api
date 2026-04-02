import { QRCodeDotsStyle, QRCodeOptions } from '@/domain/interfaces/QRCodePort'
import { QRMatrix } from './QrMatrixGenerator'

type DotsRenderOptions = Pick<QRCodeOptions, 'dotsStyle' | 'dotsColor'>

export class QrDotsRenderer {
  render(matrix: QRMatrix, cellSize: number, options: DotsRenderOptions): string {
    if (options.dotsStyle === 'fluid') {
      return this.renderFluid(matrix, cellSize, options.dotsColor ?? '#000000')
    }

    const { size, data } = matrix
    const style = options.dotsStyle ?? 'square'
    const color = options.dotsColor ?? '#000000'
    let svg = ''

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const isDark = data[row * size + col] !== 0
        if (!isDark) continue
        if (this.isFinderPattern(row, col, size)) continue

        svg += this.renderDot(col, row, cellSize, style, color)
      }
    }

    return svg
  }

  private renderFluid(matrix: QRMatrix, cellSize: number, color: string): string {
    const { size, data } = matrix
    let svg = ''

    for (let row = 0; row < size; row++) {
      let col = 0

      while (col < size) {
        const isDark = data[row * size + col] !== 0
        const isFinder = this.isFinderPattern(row, col, size)

        if (!isDark || isFinder) {
          col++
          continue
        }

        let runStart = col
        let runLength = 0

        while (col < size && data[row * size + col] !== 0 && !this.isFinderPattern(row, col, size)) {
          runLength++
          col++
        }

        const x = runStart * cellSize
        const y = row * cellSize
        const rx = cellSize * 0.5

        if (runLength === 1) {
          svg += `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${cellSize * 0.45}" fill="${color}"/>`
        } else {
          svg += `<rect x="${x}" y="${y + cellSize * 0.05}" width="${runLength * cellSize}" height="${cellSize * 0.9}" rx="${rx}" fill="${color}"/>`
        }
      }
    }

    return svg
  }

  private isFinderPattern(row: number, col: number, size: number): boolean {
    return (row < 7 && col < 7) ||
           (row < 7 && col >= size - 7) ||
           (row >= size - 7 && col < 7)
  }

  private renderDot(col: number, row: number, s: number, style: QRCodeDotsStyle, color: string): string {
    const x = col * s
    const y = row * s

    switch (style) {
      case 'dots':
        return `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.45}" fill="${color}"/>`
      case 'rounded':
        return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.3}" fill="${color}"/>`
      case 'extra-rounded':
        return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.5}" fill="${color}"/>`
      case 'classy':
        return `<rect x="${x + s * 0.1}" y="${y + s * 0.1}" width="${s * 0.8}" height="${s * 0.8}" rx="${s * 0.15}" fill="${color}"/>`
      case 'classy-rounded':
        return `<rect x="${x + s * 0.1}" y="${y + s * 0.1}" width="${s * 0.8}" height="${s * 0.8}" rx="${s * 0.35}" fill="${color}"/>`
      case 'mixed':
        return (col + row) % 2 === 0
          ? `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${color}"/>`
          : `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.45}" fill="${color}"/>`
      default:
        return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${color}"/>`
    }
  }
}
