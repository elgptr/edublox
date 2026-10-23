import { validatePasswordChangeInput, mapFirebaseAuthError } from '../src/utils/passwordValidation';

describe('Password Change & Auth Security Utilities (TDD)', () => {
  describe('validatePasswordChangeInput', () => {
    it('rejects empty current password', () => {
      const res = validatePasswordChangeInput('', 'newpass123', 'newpass123');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Kata sandi saat ini');
    });

    it('rejects new password shorter than 6 characters', () => {
      const res = validatePasswordChangeInput('oldpass123', '12345', '12345');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('minimal 6 karakter');
    });

    it('rejects when confirmation password does not match new password', () => {
      const res = validatePasswordChangeInput('oldpass123', 'newpass123', 'different123');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Konfirmasi kata sandi');
    });

    it('rejects when new password is identical to current password', () => {
      const res = validatePasswordChangeInput('samepass123', 'samepass123', 'samepass123');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('berbeda');
    });

    it('accepts valid password change input', () => {
      const res = validatePasswordChangeInput('oldpass123', 'newpass456', 'newpass456');
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });

  describe('mapFirebaseAuthError', () => {
    it('maps auth/invalid-credential and auth/wrong-password to clear Indonesian message', () => {
      expect(mapFirebaseAuthError({ code: 'auth/invalid-credential' })).toContain('Kata sandi saat ini salah');
      expect(mapFirebaseAuthError({ code: 'auth/wrong-password' })).toContain('Kata sandi saat ini salah');
    });

    it('maps auth/weak-password to minimum length message', () => {
      expect(mapFirebaseAuthError({ code: 'auth/weak-password' })).toContain('terlalu lemah');
    });

    it('maps auth/too-many-requests to rate limit message', () => {
      expect(mapFirebaseAuthError({ code: 'auth/too-many-requests' })).toContain('Terlalu banyak percobaan');
    });

    it('falls back to error.message or default message', () => {
      expect(mapFirebaseAuthError({ message: 'Custom error' })).toBe('Custom error');
      expect(mapFirebaseAuthError(null)).toContain('Terjadi kesalahan');
    });
  });
});
