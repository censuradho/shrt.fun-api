import { describe, it, expect } from 'vitest';
import { sanitizeString } from '@/shared/sanitizeString';

describe('sanitizeString', () => {
  it('should remove single quotes, double quotes, semicolons and backslashes', () => {
    expect(sanitizeString(`it's a "test"; here\\`)).toBe('its a test here');
  });

  it('should remove SQL keywords', () => {
    expect(sanitizeString('SELECT * FROM users')).toBe('* FROM users');
    expect(sanitizeString('DROP TABLE users')).toBe('TABLE users');
    expect(sanitizeString('DELETE FROM users')).toBe('FROM users');
  });

  it('should remove SQL comment syntax', () => {
    expect(sanitizeString('value -- comment')).toBe('value  comment');
  });

  it('should trim leading and trailing spaces', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('should return undefined when value is not a string', () => {
    expect(sanitizeString(undefined)).toBeUndefined();
    expect(sanitizeString(123 as any)).toBeUndefined();
  });
});
