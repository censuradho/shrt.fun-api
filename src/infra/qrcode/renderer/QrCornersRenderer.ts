import { QRCodeCornersSquareStyle, QRCodeCornersDotStyle, QRCodeOptions } from '@/domain/interfaces/QRCodePort'
import { QRMatrix } from './QrMatrixGenerator'

type CornersRenderOptions = Pick<QRCodeOptions, 'cornersSquareStyle' | 'cornersDotStyle' | 'dotsColor' | 'backgroundColor'>

export class QrCornersRenderer {
  render(matrix: QRMatrix, cellSize: number, options: CornersRenderOptions): string {
    const { size } = matrix
    const positions = [
      { x: 0, y: 0 },
      { x: (size - 7) * cellSize, y: 0 },
      { x: 0, y: (size - 7) * cellSize },
    ]

    return positions
      .map(pos => this.renderFinderPattern(pos.x, pos.y, cellSize, options))
      .join('')
  }

  private renderFinderPattern(
    x: number,
    y: number,
    s: number,
    options: CornersRenderOptions,
  ): string {
    const color = options.dotsColor ?? '#000000'
    const bg = options.backgroundColor ?? '#ffffff'

    const outerSize = 7 * s
    const holeSize = 5 * s
    const dotSize = 3 * s

    const outerRx = this.getOuterRadius(options.cornersSquareStyle, outerSize)
    const outer = `<rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${outerRx}" fill="${color}"/>`

    const hole = `<rect x="${x + s}" y="${y + s}" width="${holeSize}" height="${holeSize}" fill="${bg}"/>`

    const inner = this.renderInnerDot(x + 2 * s, y + 2 * s, dotSize, options.cornersDotStyle, color)

    return outer + hole + inner
  }

  private getOuterRadius(style: QRCodeCornersSquareStyle | undefined, size: number): number {
    switch (style) {
    case 'extra-rounded': return size * 0.25
    case 'dot': return size * 0.5
    default: return 0
    }
  }

  private renderInnerDot(
    x: number,
    y: number,
    size: number,
    style: QRCodeCornersDotStyle | undefined,
    color: string,
  ): string {
    if (style === 'dot') {
      return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${color}"/>`
    }

    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`
  }
}
