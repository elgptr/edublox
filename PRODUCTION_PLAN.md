# 📋 Rencana Kerja Menuju Production (Edunesis.com)

Dokumen ini berisi hasil audit kondisi saat ini dan progres implementasi bertahap sebelum **Edunesis** dinaikkan penuh ke production pada domain **`edunesis.com`**.

---

## 📊 Ringkasan Progress Eksekusi

| Tahap | Deskripsi Pekerjaan | Status | Waktu Update |
| :--- | :--- | :--- | :--- |
| **Tahap 1** | Standarisasi domain `@edunesis.com` di seluruh source code & pembuatan akun `admin@edunesis.com` + `user@edunesis.com` di Firebase | ✅ **SELESAI** | 23 Okt 2026 |
| **Tahap 2** | Implementasi fitur **Ganti Kata Sandi** (User & Admin), **Lupa Kata Sandi** (Login), **Kirim Reset Sandi** (Admin Panel) + Unit Test TDD | ✅ **SELESAI** | 23 Okt 2026 |
| **Tahap 3** | Pembersihan Git staging (`edunesis api key.txt`), verifikasi 70 unit test (`npm test`), build web (`npm run build:web`), & Deploy Vercel | ✅ **SELESAI** | 23 Okt 2026 |
| **Tahap 4** | Konfigurasi Custom Domain `edunesis.com` di Dashboard Vercel, DNS Registrar, & Firebase Authorized Domains | ⏳ **MENUNGGU SETTING DNS/CONSOLE** | - |

---

## 🔍 1. Hasil Pengecekan Firebase & Akun Saat Ini

### A. Identitas Project Firebase
- **Project ID**: `edublox-73d4d`
- **Auth Domain**: `edublox-73d4d.firebaseapp.com`
- **Akun Google / Owner yang tercatat di Firestore**: **`workbuatkamu@gmail.com`** (Display Name: `el`, UID: `JdHTgMxiQoU5rOU9ylpmgiLbwGs2`)

### B. Status Akun di Firebase Authentication & Firestore Saat Ini
| Email | Password | Role | Status di Firebase Auth | UID Firebase |
| :--- | :--- | :--- | :--- | :--- |
| **`admin@edunesis.com`** | **`admin123456`** | `admin` | ✅ **Aktif (Utama)** | `OEdt8YemuohYagSuZoEy86BXEHh1` |
| **`user@edunesis.com`** | **`user123456`** | `user` | ✅ **Aktif (Utama)** | `py8oAYDJIITUQNYfpfks0LWENwi1` |
| `workbuatkamu@gmail.com` | *(Pribadi)* | `user` (Diskon 99%) | ✅ Terdaftar | `JdHTgMxiQoU5rOU9ylpmgiLbwGs2` |
| `admin@edublox.id` | `admin123456` | `admin` | ✅ Aktif (Legacy) | `umNssx6OSbR5wxphwG6iGBsYvI62` |
| `user@edublox.id` | `user123456` | `user` | ✅ Aktif (Legacy) | `LgTlhsegzihgaXA4al6LmtOopOI3` |

### C. Kepemilikan Domain Resmi
Domain yang dimiliki:
1. **`edunesis.com`** *(Domain Utama Production)*
2. **`edunesis.info`** *(Opsional: Redirect ke `edunesis.com`)*
3. **`edunesis.org`** *(Opsional: Redirect ke `edunesis.com`)*
4. **`edunesis.store`** *(Opsional: Redirect ke `edunesis.com`)*

---

## 🛠️ 2. Detail Implementasi yang Telah Diselesaikan

### ✅ Tahap 1: Penyelarasan Domain `@edunesis.com` & Provisioning Akun Firebase
- [x] Mengubah seluruh referensi `@edunesis.id` menjadi `@edunesis.com` pada:
  - `src/screens/LoginScreen.tsx`
  - `src/hooks/useAuth.ts`
  - `src/screens/AdminScreen.tsx`
  - `src/components/FeedbackModal.tsx`
  - `TEST_ACCOUNTS.md`
- [x] Membuat akun `admin@edunesis.com` (`admin123456`) dan `user@edunesis.com` (`user123456`) di Firebase Auth & koleksi `users` Firestore (`edublox-73d4d`).

### ✅ Tahap 2: Fitur Ganti Password & Lupa Password (User & Admin)
- [x] **Validasi & Error Mapping (`src/utils/passwordValidation.ts`)**:
  - Guard clauses untuk validasi password saat ini, minimal 6 karakter, kecocokan konfirmasi, dan pencegahan password baru sama dengan password lama.
  - Pemetaan kode error Firebase Auth ke pesan Bahasa Indonesia yang informatif.
- [x] **Service & Hook (`src/services/firebaseService.ts` & `src/hooks/useAuth.ts`)**:
  - `changePassword(currentPassword, newPassword)` dengan `EmailAuthProvider.credential` + `reauthenticateWithCredential` + `updatePassword`.
  - `sendPasswordReset(email)` dengan `sendPasswordResetEmail`.
- [x] **UI Ganti Kata Sandi Mandiri (`src/screens/AIKeyInputScreen.tsx`)**:
  - Kartu **"🔒 Keamanan Akun & Ganti Kata Sandi"** untuk **Siswa maupun Admin** lengkap dengan tombol tampilkan/sembunyikan sandi dan opsi kirim link reset ke email aktif.
- [x] **UI Lupa Kata Sandi (`src/screens/LoginScreen.tsx`)**:
  - Mode **"Lupa Kata Sandi?"** pada kartu login untuk mengirim email reset password.
- [x] **Fitur Reset Password oleh Admin (`src/screens/AdminScreen.tsx`)**:
  - Tombol **"🔑 Kirim Reset Sandi"** pada setiap kartu user di tab *User & Subscription*.
  - Tombol pintas **"🔒 Ganti Sandi Admin"** di header Admin Panel.
- [x] **Unit Testing TDD (`__tests__/passwordAuth.test.ts`)**:
  - 9 test case baru lolos 100% (total 9 test suites, 70 unit tests lolos).

### ✅ Tahap 3: Keamanan Repository, Build Web & Deploy Vercel
- [x] Unstage file `"edunesis api key.txt"` (`git reset HEAD "edunesis api key.txt"`) sehingga terlindungi oleh `.gitignore`.
- [x] Verifikasi `npm test` (70/70 passed) dan `npm run build:web` (`dist/` berhasil di-export).
- [x] Commit perubahan dan deploy ke Vercel Production.

---

## 🌐 3. Panduan Tahap 4: Menghubungkan Domain `edunesis.com` ke Production

1. **Di Dashboard Vercel (`Settings` → `Domains`)**:
   - Buka [Vercel Dashboard](https://vercel.com/dashboard) → pilih project **`edublox`**.
   - Masuk ke **Settings** → **Domains**.
   - Tambahkan **`edunesis.com`** (pilih opsi redirect `www.edunesis.com` ke `edunesis.com`).
   - *(Opsional)* Tambahkan juga `edunesis.info`, `edunesis.org`, dan `edunesis.store` lalu arahkan (*Redirect 308*) ke `edunesis.com`.
2. **Di Panel DNS Registrar Domain (`edunesis.com`)**:
   - Tambahkan **A Record**: Host `@` → Value `76.76.21.21`
   - Tambahkan **CNAME Record**: Host `www` → Value `cname.vercel-dns.com`
3. **Di Firebase Console (`edublox-73d4d` → `Authentication` → `Settings` → `Authorized domains`)**:
   - Login ke [Firebase Console](https://console.firebase.google.com/) menggunakan akun Google **`workbuatkamu@gmail.com`**.
   - Pilih project **`edublox-73d4d`** → **Authentication** → **Settings** → **Authorized domains**.
   - Klik **Add domain** dan masukkan:
     - `edunesis.com`
     - `www.edunesis.com`
     - `edunesis.info`
     - `edunesis.org`
     - `edunesis.store`
