export type QRCodeDotsStyle =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded'
  | 'mixed'
  | 'fluid'

export type QRCodeCornersSquareStyle = 'dot' | 'square' | 'extra-rounded'

export type QRCodeCornersDotStyle = 'dot' | 'square'

export interface QRCodeOptions {
  dotsStyle?: QRCodeDotsStyle
  dotsColor?: string
  backgroundColor?: string
  cornersSquareStyle?: QRCodeCornersSquareStyle
  cornersDotStyle?: QRCodeCornersDotStyle
  centerLogo?: string     // base64
  watermarkLogo?: string  // base64 — renderizado no canto inferior direito
  hideWatermark?: boolean
}

export interface IQRCodePort {
  generate(url: string, options?: QRCodeOptions): Promise<string>
}
