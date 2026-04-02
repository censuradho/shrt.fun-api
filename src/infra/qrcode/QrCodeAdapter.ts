import { IQRCodePort, QRCodeOptions } from '@/domain/interfaces/QRCodePort'
import { readFileSync } from 'fs'
import { QrMatrixGenerator } from './renderer/QrMatrixGenerator'
import { QrDotsRenderer } from './renderer/QrDotsRenderer'
import { QrCornersRenderer } from './renderer/QrCornersRenderer'
import { QrImageInjector } from './renderer/QrImageInjector'
import { QrSvgAssembler } from './renderer/QrSvgAssembler'

const DEFAULT_WATERMARK = (() => {
  const assetUrl = new URL('../../assets/watermark-logo.svg', import.meta.url)
  const file = readFileSync(assetUrl)
  return `data:image/svg+xml;base64,${file.toString('base64')}`
})()

const SVG_SIZE = 400

export class QRCodeAdapter implements IQRCodePort {
  private readonly matrixGenerator = new QrMatrixGenerator()
  private readonly dotsRenderer = new QrDotsRenderer()
  private readonly cornersRenderer = new QrCornersRenderer()
  private readonly imageInjector = new QrImageInjector()
  private readonly svgAssembler = new QrSvgAssembler()

  async generate(url: string, options: QRCodeOptions = {}): Promise<string> {
    const matrix = await this.matrixGenerator.generate(url)
    const cellSize = SVG_SIZE / (matrix.size + 4) // +4 para quiet zone (2 de cada lado)
    const backgroundColor = options.backgroundColor ?? '#ffffff'

    const qrContent = [
      this.dotsRenderer.render(matrix, cellSize, options),
      this.cornersRenderer.render(matrix, cellSize, { ...options, backgroundColor }),
    ].join('')

    let svg = this.svgAssembler.assemble({
      qrContent,
      svgSize: SVG_SIZE,
      cellSize,
      backgroundColor,
    })

    if (options.centerLogo) {
      svg = this.svgAssembler.inject(svg, this.imageInjector.centerLogoElement(options.centerLogo, SVG_SIZE))
    }

    const watermark = options.watermarkLogo ?? DEFAULT_WATERMARK

    svg = this.svgAssembler.inject(svg, this.imageInjector.watermarkElement(watermark, SVG_SIZE, backgroundColor))

    return svg
  }
}
