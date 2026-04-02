import { IQRCodePort, QRCodeOptions } from '@/domain/interfaces/QRCodePort'
import { watermarkLogo } from '../../assets/watermark-logo'
import { QrMatrixGenerator } from './renderer/QrMatrixGenerator'
import { QrDotsRenderer } from './renderer/QrDotsRenderer'
import { QrCornersRenderer } from './renderer/QrCornersRenderer'
import { QrImageInjector } from './renderer/QrImageInjector'
import { QrSvgAssembler } from './renderer/QrSvgAssembler'

const SVG_SIZE = 400

export class QRCodeAdapter implements IQRCodePort {
  private readonly matrixGenerator = new QrMatrixGenerator()
  private readonly dotsRenderer = new QrDotsRenderer()
  private readonly cornersRenderer = new QrCornersRenderer()
  private readonly imageInjector = new QrImageInjector()
  private readonly svgAssembler = new QrSvgAssembler()

  async generate(url: string, options: QRCodeOptions = {}): Promise<string> {
    const matrix = await this.matrixGenerator.generate(url)
    const cellSize = SVG_SIZE / (matrix.size + 4)
    const backgroundColor = options.backgroundColor ?? '#ffffff'
    const dotsColor = options.dotsColor ?? '#000000'

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

    if (!options.hideWatermark) {
      const watermark = options.watermarkLogo ?? watermarkLogo
      svg = this.svgAssembler.inject(svg, this.imageInjector.watermarkElement(watermark, SVG_SIZE, backgroundColor, dotsColor))
    }

    return svg
  }
}
