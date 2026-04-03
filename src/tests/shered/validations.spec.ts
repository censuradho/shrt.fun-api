import { describe, it, expect } from 'vitest';
import { slugValidation, urlValidation } from '@/shared/validations';

describe('slugValidation', () => {
  it('should return true for valid slugs', () => {
    expect(slugValidation('my-slug')).toBe(true);
    expect(slugValidation('abc123')).toBe(true);
    expect(slugValidation('hello-world-123')).toBe(true);
  });

  it('should return false for slugs with uppercase letters', () => {
    expect(slugValidation('MySlug')).toBe(false);
  });

  it('should return false for slugs with leading or trailing hyphens', () => {
    expect(slugValidation('-slug')).toBe(false);
    expect(slugValidation('slug-')).toBe(false);
  });

  it('should return false for slugs with spaces or special chars', () => {
    expect(slugValidation('my slug')).toBe(false);
    expect(slugValidation('slug_name')).toBe(false);
    expect(slugValidation('slug.name')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(slugValidation('')).toBe(false);
  });
});

describe('urlValidation', () => {
  it('should return true for valid URLs', () => {
    expect(urlValidation('https://www.google.com')).toBe(true);
    expect(urlValidation('http://example.com/path?query=1')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(urlValidation('not-a-url')).toBe(false);
    expect(urlValidation('www.google.com')).toBe(false);
    expect(urlValidation('')).toBe(false);
  });
});
