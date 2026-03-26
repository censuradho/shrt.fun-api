export interface DeviceResult {
  device: string | null
  os: string | null
  browser: string | null
}

export interface IDeviceService {
  parse(userAgent: string): DeviceResult
}
