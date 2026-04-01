export interface IQRCodePort {
  generate (url: string): Promise<string>
}
