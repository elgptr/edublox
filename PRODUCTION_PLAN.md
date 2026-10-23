# 📋 Rencana Kerja Menuju Production (Edunesis.com)

Dokumen ini berisi hasil audit kondisi saat ini dan progres implementasi bertahap sebelum **Edunesis** dinaikkan penuh ke production pada domain **`edunesis.com`**.

---

## 📊 Ringkasan Progress Eksekusi

| Tahap | Deskripsi Pekerjaan | Status | Waktu Update |
| :--- | :--- | :--- | :--- |
| **Tahap 1** | Standarisasi domain `@edunesis.com` di seluruh source code & pembuatan akun `admin@edunesis.com` + `user@edunesis.com` di Firebase | ✅ **SELESAI** | 23 Okt 2026 |
| **Tahap 2** | Implementasi fitur **Ganti Kata Sandi** (User & Admin), **Lupa Kata Sandi** (Login), **Kirim Reset Sandi** (Admin Panel) + Unit Test TDD | ✅ **SELESAI** | 23 Okt 2026 |
| **Tahap 3** | Pembersihan Git staging (`edunesis api key.txt`), 70/70 unit test lolos, build web, push ke GitHub `main`, & Deploy Vercel Production | ✅ **SELESAI** | 23 Okt 2026 |
| **Tahap 4A** | Pendaftaran 5 domain (`edunesis.com`, `www.edunesis.com`, `edunesis.info`, `edunesis.org`, `edunesis.store`) + Redirect 308 di Vercel | ✅ **SELESAI (OTOMATIS VIA API)** | 23 Okt 2026 |
| **Tahap 4B** | Pendaftaran 4 Zone di **Cloudflare**, setting DNS Record (`A` & `CNAME`) ke Vercel, + **Email Routing** (`admin@edunesis.com` & `user@edunesis.com` → `workbuatkamu@gmail.com`) | ✅ **SELESAI (OTOMATIS VIA API)** | 23 Okt 2026 |
| **Tahap 4C** | Ganti Nameserver di Registrar (IONOS) ke Cloudflare (`arturo.ns.cloudflare.com` & `nora.ns.cloudflare.com`) & Whitelist di Firebase Console | ⏳ **TINGGAL GANTI NAMESERVER** | - |

---

## 🔍 1. Hasil Pengecekan Firebase, Vercel & Cloudflare

### A. Identitas Project Firebase
- **Project ID**: `edublox-73d4d`
- **Auth Domain**: `edublox-73d4d.firebaseapp.com`
- **Akun Google / Owner yang tercatat di Firestore**: **`workbuatkamu@gmail.com`** (Display Name: `el`, UID: `JdHTgMxiQoU5rOU9ylpmgiLbwGs2`)

### B. Status Akun di Firebase Authentication & Firestore Saat Ini
| Email | Password | Role | Status di Firebase Auth | Email Forwarding (Cloudflare) |
| :--- | :--- | :--- | :--- | :--- |
| **`admin@edunesis.com`** | **`admin123456`** | `admin` | ✅ **Aktif (Utama)** | ➡️ Forward ke `workbuatkamu@gmail.com` |
| **`user@edunesis.com`** | **`user123456`** | `user` | ✅ **Aktif (Utama)** | ➡️ Forward ke `workbuatkamu@gmail.com` |
| `workbuatkamu@gmail.com` | *(Pribadi)* | `user` (Diskon 99%) | ✅ Terdaftar | Inbox Utama |
| `admin@edublox.id` | `admin123456` | `admin` | ✅ Aktif (Legacy) | - |
| `user@edublox.id` | `user123456` | `user` | ✅ Aktif (Legacy) | - |

### C. Status Zone & DNS di Cloudflare (`workbuatkamu@gmail.com` / `078f4bc71ea99dedf41ca72df2df9fb2`)
| Domain | Zone ID Cloudflare | DNS Records (Sudah Diset Otomatis) | Nameserver Cloudflare | Status di Vercel |
| :--- | :--- | :--- | :--- | :--- |
| **`edunesis.com`** | `f3e10c63eed6f220839033e83d3ad592` | `A @ -> 216.198.79.1`<br>`CNAME www -> cde4c5b7e8037710.vercel-dns-017.com`<br>`MX route1/2/3.mx.cloudflare.net` + `TXT SPF` | `arturo.ns.cloudflare.com`<br>`nora.ns.cloudflare.com` | **Domain Utama Production** |
| **`edunesis.info`** | `fcc0794e796201ec36082ae3a2946e20` | `A @ -> 216.198.79.1`<br>`CNAME www -> cde4c5b7e8037710.vercel-dns-017.com` | `arturo.ns.cloudflare.com`<br>`nora.ns.cloudflare.com` | Redirect 308 → `edunesis.com` |
| **`edunesis.org`** | `8c0e766877b2c42ed367027978324382` | `A @ -> 216.198.79.1`<br>`CNAME www -> cde4c5b7e8037710.vercel-dns-017.com` | `arturo.ns.cloudflare.com`<br>`nora.ns.cloudflare.com` | Redirect 308 → `edunesis.com` |
| **`edunesis.store`** | `2632a4f27973303864e6353864e63538638f9519` | `A @ -> 216.198.79.1`<br>`CNAME www -> cde4c5b7e8037710.vercel-dns-017.com` | `arturo.ns.cloudflare.com`<br>`nora.ns.cloudflare.com` | Redirect 308 → `edunesis.com` |

---

## 🌐 2. Langkah Terakhir untuk Anda (Tahap 4C — Hanya 2 Menit)

Karena seluruh konfigurasi di **Vercel** dan **Cloudflare** (termasuk DNS `A`, `CNAME`, `MX`, `SPF`, dan Email Routing) sudah saya pasangkan 100% secara otomatis, Anda hanya tinggal melakukan **2 hal berikut**:

### 1. Ganti Nameserver di Tempat Anda Membeli Domain (IONOS)
Buka pengaturan **Nameserver** untuk **`edunesis.com`**, **`edunesis.info`**, **`edunesis.org`**, dan **`edunesis.store`**, lalu ganti Nameserver bawaan (`ns1017.ui-dns.com` dkk.) menjadi Nameserver Cloudflare Anda:
- **Nameserver 1**: `arturo.ns.cloudflare.com`
- **Nameserver 2**: `nora.ns.cloudflare.com`

### 2. Tambahkan `edunesis.com` di Firebase Authorized Domains
1. Buka [Firebase Console — Authorized Domains](https://console.firebase.google.com/project/edublox-73d4d/authentication/settings) (login dengan **`workbuatkamu@gmail.com`**).
2. Klik **Add domain** lalu masukkan `edunesis.com` dan `www.edunesis.com`.
