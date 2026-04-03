import { describe, it, expect } from 'vitest';
import { getDomain } from '@/shared/utils/getDomain';

describe('getDomain', () => {
  it('should extract domain from https URL', () => {
    expect(getDomain('https://www.google.com/path')).toBe('google.com');
  });

  it('should extract domain from http URL', () => {
    expect(getDomain('http://example.com')).toBe('example.com');
  });

  it('should handle URL without www', () => {
    expect(getDomain('https://github.com/user/repo')).toBe('github.com');
  });

  it('should handle URL without protocol', () => {
    expect(getDomain('www.example.com/path')).toBe('example.com');
  });

  it('should handle bare domain', () => {
    expect(getDomain('example.com')).toBe('example.com');
  });
});
