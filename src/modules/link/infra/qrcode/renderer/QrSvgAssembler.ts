const QUIET_ZONE_MODULES = 2

export interface QrSvgAssemblerInput {
  qrContent: string
  svgSize: number
  cellSize: number
  backgroundColor: string
}

export class QrSvgAssembler {
  assemble({ qrContent, svgSize, cellSize, backgroundColor }: QrSvgAssemblerInput): string {
    const offset = QUIET_ZONE_MODULES * cellSize

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">`,
      `<rect width="${svgSize}" height="${svgSize}" fill="${backgroundColor}"/>`,
      `<g transform="translate(${offset},${offset})">`,
      qrContent,
      `</g>`,
      `</svg>`,
    ].join('')
  }

  inject(svg: string, element: string): string {
    return svg.replace('</svg>', `${element}</svg>`)
  }
}
