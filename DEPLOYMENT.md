# Panduan Menjalankan & Deploy Edunesis (Web, Android, iOS)

Edunesis kini telah sepenuhnya disiapkan dan dioptimalkan agar dapat berjalan lintas platform: **Web (Vercel)**, **Android**, dan **iOS**.

---

## 1. Menjalankan di Web (Lokal)
Untuk menjalankan versi Web di browser lokal:
```bash
npm run dev
# atau
npx expo start --web
```
Aplikasi akan langsung terbuka di browser (`http://localhost:8081`).

---

## 2. Deploy ke Vercel (Gratis)

Aplikasi telah dilengkapi dengan file konfigurasi [`vercel.json`](./vercel.json) yang telah disesuaikan dengan output build Expo (`dist/`).

### Cara Deploy via Vercel Dashboard (Rekomendasi):
1. **Push repository Edublox ke GitHub**:
   ```bash
   git add .
   git commit -m "feat: cross-platform web, android, ios support & vercel config"
   git push origin main
   ```
2. **Buka Vercel**: Masuk ke [vercel.com](https://vercel.com) (login dengan GitHub).
3. **Klik "Add New Project"** dan pilih repository **edublox**.
4. Pengaturan build akan otomatis terdeteksi dari `vercel.json`:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `dist`
5. *(Opsional)* Di bagian **Environment Variables**, tambahkan jika ingin mengganti key:
   - `EXPO_PUBLIC_SYSTEM_GEMINI_KEY`
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
6. **Klik "Deploy"**. Dalam ~1 menit, aplikasi Edunesis aktif di `https://edublox.vercel.app`!

### Cara Deploy via Vercel CLI:
```bash
npm install -g vercel
vercel
```

---

## 3. Menjalankan di Android & iOS (Mobile)

### Opsi A: Menggunakan Expo Go (Instan, Tanpa Build)
1. Install aplikasi **Expo Go** di ponsel Anda via Google Play Store (Android) atau App Store (iOS).
2. Jalankan di komputer:
   ```bash
   npm start
   ```
3. - **Android**: Buka aplikasi Expo Go, pilih "Scan QR Code", lalu scan QR yang muncul di terminal.
   - **iOS**: Buka kamera bawaan iPhone, arahkan ke QR code di terminal, lalu ketuk pop-up Expo Go.

### Opsi B: Build APK Android Mandiri (EAS Build)
Jika ingin menghasilkan file `.apk` mandiri yang bisa diinstall di HP:
```bash
npx eas build -p android --profile preview
```
