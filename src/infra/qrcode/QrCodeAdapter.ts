import { IQRCodePort } from "@/domain/interfaces/QRCodePort";
import qrcode from 'qrcode'

export class QRCodeAdapter implements IQRCodePort {
  async generate (url: string): Promise<string> {
    
    return qrcode.toDataURL(url)
  }
}