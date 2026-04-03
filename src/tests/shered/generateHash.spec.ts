import { describe, it, expect } from 'vitest';
import { generateHash } from '@/shared/generateHash';

describe('generateHash', () => {
  it('should generate a hash with default length of 8', () => {
    const hash = generateHash();
    expect(hash).toHaveLength(8);
  });

  it('should generate a hash with the specified length', () => {
    expect(generateHash(4)).toHaveLength(4);
    expect(generateHash(16)).toHaveLength(16);
  });

  it('should only contain alphanumeric characters', () => {
    const hash = generateHash(100);
    expect(hash).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('should generate different hashes on consecutive calls', () => {
    const hashes = new Set(Array.from({ length: 20 }, () => generateHash()));
    expect(hashes.size).toBeGreaterThan(1);
  });
});
