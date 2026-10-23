export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

const FIREBASE_AUTH_ERROR_MAP: Record<string, string> = {
  'auth/invalid-credential': 'Kata sandi saat ini salah. Silakan periksa kembali kata sandi Anda.',
  'auth/wrong-password': 'Kata sandi saat ini salah. Silakan periksa kembali kata sandi Anda.',
  'auth/weak-password': 'Kata sandi baru terlalu lemah (minimal 6 karakter).',
  'auth/requires-recent-login': 'Sesi login Anda sudah terlalu lama. Silakan keluar (logout) dan masuk kembali terlebih dahulu.',
  'auth/too-many-requests': 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat lagi.',
  'auth/user-not-found': 'Akun dengan alamat email tersebut tidak ditemukan.',
  'auth/invalid-email': 'Format alamat email tidak valid.',
};

/**
 * Validasi input ganti password dengan Guard Clauses (Fail Fast)
 */
export function validatePasswordChangeInput(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): PasswordValidationResult {
  if (!currentPassword || !currentPassword.trim()) {
    return { valid: false, error: 'Kata sandi saat ini wajib diisi.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { valid: false, error: 'Kata sandi baru minimal 6 karakter.' };
  }
  if (newPassword !== confirmPassword) {
    return { valid: false, error: 'Konfirmasi kata sandi baru tidak cocok.' };
  }
  if (currentPassword === newPassword) {
    return { valid: false, error: 'Kata sandi baru harus berbeda dari kata sandi saat ini.' };
  }
  return { valid: true };
}

/**
 * Konversi error Firebase Auth menjadi pesan Bahasa Indonesia yang jelas
 */
export function mapFirebaseAuthError(error: any): string {
  if (!error) {
    return 'Terjadi kesalahan saat memproses autentikasi.';
  }
  const code = error.code as string | undefined;
  if (code && FIREBASE_AUTH_ERROR_MAP[code]) {
    return FIREBASE_AUTH_ERROR_MAP[code];
  }
  return error.message || 'Terjadi kesalahan saat memproses autentikasi.';
}
