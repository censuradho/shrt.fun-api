import QRCode from 'qrcode'

export interface QRMatrix {
  data: Uint8ClampedArray
  size: number
}

export class QrMatrixGenerator {
  async generate(url: string): Promise<QRMatrix> {
    const qr = QRCode.create(url, { errorCorrectionLevel: 'H' })

    return {
      data: qr.modules.data as any, 
      size: qr.modules.size,
    }
  }
}
