import { describe, it, expect } from 'vitest';
import { SupabaseErrorMapper } from '@/modules/auth/infra/auth/SupabaseErrorMapper';
import { HTTP_ERROR_CODES } from '@/shared/constants/httpStatusCodes';

describe('SupabaseErrorMapper', () => {
  describe('toAppError', () => {
    it('should return CONFLICT for duplicate/already exists errors', () => {
      const error = SupabaseErrorMapper.toAppError({ message: 'User already exists' });
      expect(error.status).toBe(HTTP_ERROR_CODES.CONFLICT);
    });

    it('should return CONFLICT for duplicate keyword', () => {
      const error = SupabaseErrorMapper.toAppError({ message: 'duplicate key value violates unique constraint' });
      expect(error.status).toBe(HTTP_ERROR_CODES.CONFLICT);
    });

    it('should return BAD_REQUEST for password errors', () => {
      const error = SupabaseErrorMapper.toAppError({ message: 'Password must be at least 6 characters' });
      expect(error.status).toBe(HTTP_ERROR_CODES.BAD_REQUEST);
    });

    it('should use the error status if it is a known HTTP code', () => {
      const error = SupabaseErrorMapper.toAppError({ message: 'Unauthorized', status: 401 });
      expect(error.status).toBe(HTTP_ERROR_CODES.UNAUTHORIZED);
    });

    it('should fall back to INTERNAL_SERVER_ERROR for unknown status codes', () => {
      const error = SupabaseErrorMapper.toAppError({ message: 'Something weird', status: 999 });
      expect(error.status).toBe(HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR);
    });

    it('should fall back to INTERNAL_SERVER_ERROR when status is absent', () => {
      const error = SupabaseErrorMapper.toAppError({ message: 'Generic error' });
      expect(error.status).toBe(HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR);
    });

    it('should use fallbackMessage when error has no message', () => {
      const error = SupabaseErrorMapper.toAppError({}, 'fallback message');
      expect(error.message).toBe('fallback message');
    });

    it('should forward error code', () => {
      const error = SupabaseErrorMapper.toAppError({ message: 'oops', code: 'auth/invalid-token' });
      expect(error.code).toBe('auth/invalid-token');
    });
  });
});
