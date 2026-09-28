# 📱 Edublox - Panduan Pengguna Phase 2

**Untuk**: Pengguna / Developer  
**Phase**: 2 - Firebase & Navigation ✅  
**Waktu Baca**: 10 menit  

---

## 🚀 Quick Start (Langsung ke Aksi)

### Step 1: Setup Firebase (15 menit)
Buka file: **`FIREBASE_SETUP.md`** dan ikuti sampai selesai.

### Step 2: Configure App
```bash
cp .env.example .env
# Edit .env dengan credentials dari Firebase
```

### Step 3: Install & Run
```bash
npm install
npm run dev
```

### Step 4: Test
1. Buat akun baru
2. Login dengan akun tersebut
3. Logout & login lagi
4. Selesai ✅

---

## 📋 Fitur Phase 2

✅ **Login/Signup** - Email & password auth  
✅ **User Profile** - Data tersimpan di Firestore  
✅ **Session Persistence** - Tetap login setelah app ditutup  
✅ **Error Handling** - Pesan error yang jelas (Bahasa Indonesia)  
✅ **Navigation** - Screen flow yang smooth  

---

## 📚 Dokumentasi

| File | Untuk Apa | Baca |
|------|----------|------|
| **FIREBASE_SETUP.md** | Setup Firebase project | 10 min |
| **README.md** | Overview project | 5 min |
| **HUMAN_GUIDE.md** | Guide ini | 5 min |

---

## ❓ FAQ

**Q: Saya belum buat Firebase project?**  
A: Buka `FIREBASE_SETUP.md`, sangat detail step-by-stepnya.

**Q: .env file apa isinya?**  
A: Copy template dari `.env.example`, isi dengan Firebase config. Lihat `FIREBASE_SETUP.md` untuk credentials mana yang diambil.

**Q: Error "Firebase not initialized"?**  
A: Pastikan `.env` file sudah diisi dengan benar. Cek lagi di Firebase Console.

**Q: Setelah login, apa yang terjadi?**  
A: App akan otomatis pindah ke SetupScreen (screen untuk konfigurasi exam). Kalau mau lanjut, itu Phase 3.

**Q: Bisa test di emulator?**  
A: Ya, run `npm run dev` dan gunakan Expo app atau emulator Android/iOS.

---

## ✅ Checklist Sebelum Run

- [ ] Node.js 18+ sudah install
- [ ] `npm install` sudah dijalankan
- [ ] Firebase project sudah dibuat
- [ ] `.env` file sudah diisi credentials
- [ ] Tidak ada error di terminal

---

## 🎯 Apa Next?

Setelah Phase 2 working:
- Phase 3 akan tambah fitur exam (generate soal, jawab, lihat hasil)
- ETA Phase 3: 2-3 jam

---

## 📞 Masalah?

1. Cek **FIREBASE_SETUP.md** - 90% masalah Firebase
2. Cek terminal untuk error messages
3. Cek `.env` file - pastikan isi dengan benar
4. Baca **README.md** untuk overview

---

**Semuanya siap! Mari mulai testing!** 🚀
