import { describe, it, expect } from 'vitest';
import { UaParserDeviceService } from '@/modules/link/infra/device/UaParserDeviceService';

const service = new UaParserDeviceService();

describe('UaParserDeviceService', () => {
  it('should detect mobile device', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
    const result = service.parse(ua);

    expect(result.device).toBe('mobile');
    expect(result.os).toBe('iOS');
  });

  it('should fall back to desktop when device type is undefined', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const result = service.parse(ua);

    expect(result.device).toBe('desktop');
    expect(result.os).toBe('Windows');
    expect(result.browser).toBe('Chrome');
  });

  it('should return null for unknown os and browser', () => {
    const result = service.parse('unknown-agent');

    expect(result.os).toBeNull();
    expect(result.browser).toBeNull();
  });
});
