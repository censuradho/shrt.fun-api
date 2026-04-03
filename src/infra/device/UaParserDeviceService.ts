import { DeviceResult, IDeviceService } from '@/domain/IDeviceService';
import { UAParser } from 'ua-parser-js';

export class UaParserDeviceService implements IDeviceService {
  parse(userAgent: string): DeviceResult {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    return {
      device: result.device.type ?? 'desktop',
      os: result.os.name ?? null,
      browser: result.browser.name ?? null,
    };
  }
}
