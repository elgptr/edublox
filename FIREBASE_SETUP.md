# Firebase Setup Guide untuk Edublox

## 🔥 Step-by-Step Firebase Project Setup

### 1. Buat Firebase Project

1. Buka https://console.firebase.google.com/
2. Klik **"Create a new project"** atau **"Add project"**
3. Masukkan nama project: `edublox`
4. Pilih region: `asia-southeast1` (Singapore - terdekat dengan Indonesia)
5. Klik **Create project** → tunggu selesai (~1-2 menit)

### 2. Setup Authentication

1. Di Firebase Console, pilih project `edublox`
2. Klik **Authentication** di sidebar kiri
3. Klik tab **Sign-in method**
4. Cari dan aktifkan **Email/Password**:
   - Klik **Email/Password**
   - Toggle ON untuk "Email/Password"
   - Klik **Save**

### 3. Setup Firestore Database

1. Di sidebar, klik **Firestore Database**
2. Klik **Create database**
3. Pilih region: `asia-southeast1`
4. Pilih **Start in test mode** (untuk development)
5. Klik **Create**

**Important**: Test mode akan expire dalam 30 hari. Saat production, setup proper security rules.

### 4. Dapatkan Web Config

1. Di sidebar, klik **Project Settings** (roda gigi icon)
2. Klik tab **Your apps**
3. Jika belum ada, klik **</>** untuk buat Web app
4. Masukkan nama app: `edublox-mobile`
5. Copy kode yang berisi `firebaseConfig`

Akan terlihat seperti:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "edublox-xxxxx.firebaseapp.com",
  projectId: "edublox-xxxxx",
  storageBucket: "edublox-xxxxx.appspot.com",
  messagingSenderId: "xxxxxxxxxxxxx",
  appId: "1:xxxxxxxxxxxxx:web:xxxxxxxxxxxxxxx",
};
```

### 5. Setup Environment Variables

1. Buka file `.env` di project root (copy dari `.env.example` jika belum ada):

```bash
# Copy config dari Firebase ke sini
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=edublox-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=edublox-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=edublox-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxxx
REACT_APP_FIREBASE_APP_ID=1:xxxxxxxxxxxxx:web:xxxxxxxxxxxxxxx
```

2. Replace semua `YOUR_*` dengan nilai dari Firebase console
3. **Simpan file**

---

## 🔒 Firestore Security Rules (Development)

Di **Firestore Database** → **Rules** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow reads/writes for authenticated users
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /exams/{examId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

Klik **Publish** untuk apply rules.

---

## 📱 Android/iOS Setup (Optional untuk Sekarang)

Untuk build native app nanti, Anda juga perlu:
- Android: Google Services JSON file
- iOS: GoogleService-Info.plist

Tapi untuk development dengan Expo, web config sudah cukup.

---

## ✅ Checklist

- [ ] Firebase project dibuat
- [ ] Authentication (Email/Password) diaktifkan
- [ ] Firestore database dibuat
- [ ] Web config didapatkan
- [ ] `.env` file di-update dengan credentials
- [ ] Firestore security rules di-setup

---

## 🆘 Troubleshooting

**Q: Forgot API Key?**  
A: Kembali ke Firebase Console → Project Settings → Your apps → Lihat config lagi

**Q: Test mode expired?**  
A: Update security rules untuk production (lihat contoh di atas)

**Q: .env file tidak ter-load?**  
A: Pastikan restart dev server setelah edit `.env`

---

**Setelah semua selesai, lanjut ke implementation Phase 2!**
