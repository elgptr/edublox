import type { GradeLevel, Semester, ExamPeriod, CurriculumType } from '../types';

export interface TopicSuggestion {
  subject: string;
  topic: string;
  icon: string;
  syllabusCode?: string;
  levelTag?: string;
}

export const CURRICULUM_TOPICS: Record<GradeLevel, Record<Semester, Record<ExamPeriod, TopicSuggestion[]>>> = {
  'pra-tk': {
    I: {
      regular: [
        { subject: 'Mengenal Warna', topic: 'Mengenal 4 Warna Dasar (Merah, Kuning, Biru, Hijau)', icon: '🎨' },
        { subject: 'Dunia Hewan', topic: 'Mengenal Suara & Gerakan Hewan Peliharaan Lucu', icon: '🐱' },
        { subject: 'Tubuhku', topic: 'Mengenal Anggota Tubuh & Panca Indra Sederhana', icon: '👀' },
        { subject: 'Visual Numerasi', topic: 'Berhitung Ceria Gambar Buah (1 sampai 3)', icon: '🍎' },
        { subject: 'Karakter Baik', topic: 'Kata Ajaib: Tolong, Maaf, dan Terima Kasih', icon: '💖' },
      ],
      pts: [
        { subject: 'PTS Pra-TK', topic: 'PTS: Mengenal Warna Benda Sekitar & Menghitung 1-3', icon: '📝' },
        { subject: 'PTS Pra-TK', topic: 'PTS: Menebak Suara Hewan & Menunjuk Anggota Tubuh', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Pra-TK', topic: 'PAS: Evaluasi Ceria Motorik Halus & Pengenalan Objek', icon: '🎯' },
        { subject: 'PAS Pra-TK', topic: 'PAS: Penilaian Akhir Semester Ceria Mengenal Warna & Hewan', icon: '🎯' },
      ],
    },
    II: {
      regular: [
        { subject: 'Bentuk Objek', topic: 'Mengenal Bentuk Dasar: Lingkaran & Segiempat', icon: '🟡' },
        { subject: 'Perbandingan', topic: 'Membedakan Ukuran: Benda Besar vs Benda Kecil', icon: '🐘' },
        { subject: 'Visual Numerasi', topic: 'Berhitung Gambar Objek Menarik (1 sampai 5)', icon: '⭐' },
        { subject: 'Makanan Sehat', topic: 'Mengenal Sayur & Buah-buahan Segar Kesukaanku', icon: '🥕' },
        { subject: 'Kebersihan', topic: 'Kebiasaan Mencuci Tangan & Menggosok Gigi Ceria', icon: '🧼' },
      ],
      pts: [
        { subject: 'PTS Pra-TK', topic: 'PTS: Menghitung Objek 1-5 & Membedakan Besar-Kecil', icon: '📝' },
        { subject: 'PTS Pra-TK', topic: 'PTS: Mengenal Bentuk Lingkaran & Makanan Sehat', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Pra-TK', topic: 'PAS: Evaluasi Kenaikan Tingkat ke Taman Kanak-Kanak', icon: '🎯' },
      ],
    },
  },
  'tk': {
    I: {
      regular: [
        { subject: 'Visual Numerasi', topic: 'Menghitung Objek Gambar & Mencocokkan Angka 1-10', icon: '🔢' },
        { subject: 'Literasi Huruf', topic: 'Mengenal Huruf Vokal Bergambar (A, I, U, E, O)', icon: '🔤' },
        { subject: 'Bentuk Geometri', topic: 'Mengenal Segitiga, Persegi, Lingkaran, dan Bintang', icon: '🔺' },
        { subject: 'Perbandingan', topic: 'Membandingkan Banyak Objek: Lebih Banyak vs Lebih Sedikit', icon: '⚖️' },
        { subject: 'Emosi & Sosial', topic: 'Mengenal Emosi Wajah: Senang, Sedih, dan Tertawa', icon: '😊' },
      ],
      pts: [
        { subject: 'PTS TK', topic: 'PTS: Berhitung Objek 1-10 & Huruf Vokal A-I-U-E-O', icon: '📝' },
        { subject: 'PTS TK', topic: 'PTS: Mengenal Bentuk Geometri & Binatang di Darat/Air', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS TK', topic: 'PAS: Evaluasi Semester 1 TK Mengenal Huruf, Angka & Bentuk', icon: '🎯' },
      ],
    },
    II: {
      regular: [
        { subject: 'Pola Visual', topic: 'Melengkapi Pola Warna & Bentuk (Sequencing Pattern)', icon: '🧩' },
        { subject: 'Penjumlahan Gambar', topic: 'Penjumlahan Bergambar Sederhana (Hasil 1 sampai 10)', icon: '➕' },
        { subject: 'Alam Semesta', topic: 'Benda Langit & Cuaca: Matahari, Awan, Hujan, Pelangi', icon: '🌈' },
        { subject: 'Dunia Hewan', topic: 'Mengelompokkan Hewan Peliharaan vs Hewan Liar', icon: '🦁' },
        { subject: 'Budi Pekerti', topic: 'Berbagi Mainan & Kerja Sama dengan Teman Sebaya', icon: '🤝' },
      ],
      pts: [
        { subject: 'PTS TK', topic: 'PTS: Penjumlahan Gambar hingga 10 & Melengkapi Pola', icon: '📝' },
        { subject: 'PTS TK', topic: 'PTS: Gejala Alam Cuaca & Pengelompokan Hewan', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS TK', topic: 'PAS: Penilaian Akhir Tahun TK Persiapan Naik ke Kelompok B / Pra-SD', icon: '🎯' },
      ],
    },
  },
  'pra-sd': {
    I: {
      regular: [
        { subject: 'Calistung Baca', topic: 'Membaca 2 Suku Kata Sederhana (BA-JU, BO-LA, BU-KU)', icon: '📖' },
        { subject: 'Calistung Hitung', topic: 'Berhitung Gambar & Penjumlahan Benda (1 sampai 15)', icon: '🧮' },
        { subject: 'Pengukuran Visual', topic: 'Membandingkan Panjang-Pendek & Berat-Ringan Objek', icon: '📏' },
        { subject: 'Logika Spasial', topic: 'Arah dan Posisi: Kiri, Kanan, Atas, Bawah, Depan, Belakang', icon: '🧭' },
        { subject: 'Kesiapan SD', topic: 'Kemandirian: Merapikan Alat Tulis & Mengikuti Instruksi', icon: '🎒' },
      ],
      pts: [
        { subject: 'PTS Pra-SD', topic: 'PTS: Membaca Suku Kata Terbuka & Penjumlahan Gambar 1-15', icon: '📝' },
        { subject: 'PTS Pra-SD', topic: 'PTS: Posisi Spasial Kiri-Kanan & Perbandingan Ukuran Benda', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Pra-SD', topic: 'PAS: Asesmen Semester 1 Kesiapan Masuk Sekolah Dasar', icon: '🎯' },
      ],
    },
    II: {
      regular: [
        { subject: 'Calistung Baca', topic: 'Membaca Kalimat Pendek 3 Kata dengan Bantuan Gambar', icon: '📚' },
        { subject: 'Calistung Hitung', topic: 'Pengurangan Gambar Sederhana (Konsep Sisa Objek)', icon: '➖' },
        { subject: 'Mengenal Waktu', topic: 'Membaca Jam Sederhana (Jam 1 sampai 12) & Pagi/Malam', icon: '⏰' },
        { subject: 'Uang Sederhana', topic: 'Mengenal Nilai Uang Logam (Rp 500, Rp 1.000)', icon: '🪙' },
        { subject: 'Simulasi Tes SD', topic: 'Simulasi Soal Masuk SD: Konsentrasi, Logika & Daya Ingat', icon: '🎓' },
      ],
      pts: [
        { subject: 'PTS Pra-SD', topic: 'PTS: Pengurangan Gambar & Membaca Kalimat Bergambar', icon: '📝' },
        { subject: 'PTS Pra-SD', topic: 'PTS: Mengenal Jam Utuh & Nilai Uang Dasar', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Pra-SD', topic: 'PAS: Simulasi Akhir Kesiapan Masuk Sekolah Dasar (Lengkap)', icon: '🏆' },
      ],
    },
  },
  1: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Penjumlahan Bilangan 1 sampai 10', icon: '🔢' },
        { subject: 'Bahasa Indonesia', topic: 'Mengenal Bunyi Huruf & Suku Kata', icon: '📖' },
        { subject: 'IPAS / Sains', topic: 'Mengenal Bagian Tubuh & Panca Indra', icon: '👀' },
        { subject: 'Pancasila / PPKn', topic: 'Aturan Hidup Rukun di Rumah & Sekolah', icon: '🤝' },
        { subject: 'Matematika', topic: 'Pengurangan Sederhana Benda Sekitar', icon: '➖' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Berhitung 1-10 & Membandingkan Banyak Benda', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Huruf Vokal, Konsonan & Nama Anggota Tubuh', icon: '📝' },
        { subject: 'PTS Pancasila', topic: 'PTS: Tata Tertib Rumah & Mengenal Simbol Sila', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Merawat Kebersihan Diri & Fungsi Panca Indra', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Matematika', topic: 'PAS: Evaluasi Akhir Semester Penjumlahan & Pengurangan 1-10', icon: '🎯' },
        { subject: 'PAS Tematik', topic: 'PAS: Penilaian Akhir Semester 1 Lengkap Kelas 1 SD', icon: '🎯' },
        { subject: 'PAS B. Indonesia', topic: 'PAS: Membaca Kata Sederhana & Tanda Titik', icon: '🎯' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Penjumlahan & Pengurangan 11 sampai 20', icon: '🔢' },
        { subject: 'Matematika', topic: 'Mengenal Bentuk Bangun Datar Segitiga & Persegi', icon: '📐' },
        { subject: 'IPAS / Sains', topic: 'Benda Hidup dan Benda Tak Hidup di Sekitar', icon: '🌱' },
        { subject: 'Bahasa Indonesia', topic: 'Membaca Cerita Pendek & Menemukan Tokoh', icon: '📚' },
        { subject: 'Pancasila / PPKn', topic: 'Gotong Royong & Menjaga Kebersihan Kelas', icon: '🧹' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Operasi Hitung 11-20 & Nilai Tempat Puluhan-Satuan', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Ciri-Ciri Makhluk Hidup & Tanaman di Sekitar', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Kosakata Peristiwa Siang & Malam', icon: '📝' },
      ],
      pas: [
        { subject: 'PAT / PAS', topic: 'PAT: Kenaikan Kelas Matematika Hitung Cepat 1-20 & Bangun', icon: '🎯' },
        { subject: 'PAT / PAS', topic: 'PAT: Tematik Terpadu Semester Genap Kelas 1', icon: '🎯' },
      ],
    },
  },
  2: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Konsep Perkalian Dasar (Penjumlahan Berulang)', icon: '✖️' },
        { subject: 'Bahasa Indonesia', topic: 'Kalimat Ajakan, Perintah, dan Penolakan Santun', icon: '🗣️' },
        { subject: 'IPAS / Sains', topic: 'Wujud Benda: Padat, Cair, dan Gas', icon: '🧊' },
        { subject: 'Pancasila / PPKn', topic: 'Pengamalan Sila Pancasila di Lingkungan Keluarga', icon: '🇮🇩' },
        { subject: 'Matematika', topic: 'Satuan Panjang Baku (cm dan m)', icon: '📏' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Penjumlahan Berulang & Perkalian Angka 1-5', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Sifat dan Bentuk Benda di Rumah', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Ungkapan Sopan Santun & Dongeng Hewan Fabel', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Matematika', topic: 'PAS: Evaluasi Perkalian, Pengukuran Panjang & Satuan Berat', icon: '🎯' },
        { subject: 'PAS Tematik', topic: 'PAS: Ujian Akhir Semester 1 Tematik Terpadu Kelas 2', icon: '🎯' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Konsep Pembagian Dasar (Pengurangan Berulang)', icon: '➗' },
        { subject: 'Matematika', topic: 'Membaca Jam Dinding & Menghitung Durasi Waktu', icon: '⏰' },
        { subject: 'Matematika', topic: 'Mengenal Pecahan Sederhana (1/2, 1/3, 1/4)', icon: '🍕' },
        { subject: 'IPAS / Sains', topic: 'Merawat Hewan Ternak dan Tumbuhan', icon: '🐾' },
        { subject: 'Bahasa Indonesia', topic: 'Penggunaan Huruf Kapital dan Tanda Tanya', icon: '✍️' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Pembagian Dasar & Membaca Jam Satuan Waktu', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Cara Merawat Tanaman & Bagian-Bagian Hewan', icon: '📝' },
        { subject: 'PTS Pancasila', topic: 'PTS: Sikap Tertib dan Menjaga Keselamatan di Jalan', icon: '📝' },
      ],
      pas: [
        { subject: 'PAT / PAS', topic: 'PAT: Ujian Kenaikan Kelas Matematika Pecahan & Pembagian', icon: '🎯' },
        { subject: 'PAT Tematik', topic: 'PAT: Evaluasi Akhir Tahun Kelas 2 Terpadu', icon: '🎯' },
      ],
    },
  },
  3: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Sifat Operasi Hitung & Perkalian Bilangan Cacah', icon: '🔢' },
        { subject: 'IPAS / Sains', topic: 'Ciri-Ciri & Kebutuhan Makhluk Hidup', icon: '🦋' },
        { subject: 'IPAS / Sains', topic: 'Perubahan Wujud Benda: Mencair, Membeku, Menguap', icon: '🌡️' },
        { subject: 'Bahasa Indonesia', topic: 'Menulis Laporan Wawancara Perawatan Tumbuhan', icon: '📝' },
        { subject: 'Pancasila / PPKn', topic: 'Hak dan Kewajiban Anggota Keluarga & Siswa', icon: '⚖️' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Perkalian Ratusan & Garis Bilangan Cacah', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Daur Hidup Makhluk Hidup & Perkembangbiakan Hewan', icon: '📝' },
        { subject: 'PTS Pancasila', topic: 'PTS: Makna Lambang Garuda Pancasila & Sila 1-3', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Matematika', topic: 'PAS: Penjumlahan, Perkalian, Pembagian & Konversi Satuan', icon: '🎯' },
        { subject: 'PAS IPAS', topic: 'PAS: Penilaian Akhir Semester Perubahan Wujud Zat & Ekosistem', icon: '🎯' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Penjumlahan & Pengurangan Pecahan Berpenyebut Sama', icon: '🍰' },
        { subject: 'IPAS / Sains', topic: 'Cuaca, Iklim, dan Pengaruhnya bagi Manusia', icon: '☀️' },
        { subject: 'IPAS / Sains', topic: 'Sumber Energi, Energi Alternatif & Penghematan', icon: '⚡' },
        { subject: 'Matematika', topic: 'Menghitung Keliling & Luas Persegi serta Persegi Panjang', icon: '📐' },
        { subject: 'Bahasa Indonesia', topic: 'Perkembangan Teknologi Pangan & Komunikasi', icon: '📱' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Pecahan Berpenyebut Sama & Simetri Lipat/Putar', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Simbol Cuaca & Bentuk Sumber Energi Alternatif', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Teks Informasi Teknologi Pangan & Sandang', icon: '📝' },
      ],
      pas: [
        { subject: 'PAT / PAS', topic: 'PAT: Ujian Akhir Tahun Matematika Luas Bangun & Pecahan', icon: '🎯' },
        { subject: 'PAT IPAS', topic: 'PAT: Ujian Kenaikan Kelas Energi, Cuaca & Praja Muda Karana', icon: '🎯' },
      ],
    },
  },
  4: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Pecahan Senilai, Bentuk Desimal & Taksiran', icon: '➗' },
        { subject: 'IPAS / Sains', topic: 'Bagian Tubuh Tumbuhan & Proses Fotosintesis', icon: '🌿' },
        { subject: 'Bahasa Indonesia', topic: 'Menemukan Ide Pokok Paragraf & Teks Transitif', icon: '🔍' },
        { subject: 'Pancasila / PPKn', topic: 'Norma dalam Masyarakat & Hak Kewajiban Warga', icon: '🏛️' },
        { subject: 'IPAS / Sains', topic: 'Wujud Zat dan Perubahannya dalam Kehidupan', icon: '💧' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Pecahan Senilai, Menyederhanakan Pecahan & Desimal', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Struktur Daun, Akar, Fotosintesis & Wujud Zat', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Kalimat Transitif, Intransitif & Ide Pokok Bacaan', icon: '📝' },
        { subject: 'PTS Pancasila', topic: 'PTS: Macam-Macam Norma (Agama, Kesusilaan, Hukum)', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Matematika', topic: 'PAS: Soal Ujian Akhir Semester Pecahan, FPB & KPK', icon: '🎯' },
        { subject: 'PAS IPAS', topic: 'PAS: Kompilasi Soal Akhir Semester IPAS Bab 1-4 Kelas 4', icon: '🎯' },
        { subject: 'PAS B. Indonesia', topic: 'PAS: Teks Narasi, Fakta vs Opini, dan Wawancara', icon: '🎯' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Pengukuran Sudut, Keliling & Luas Bangun Datar', icon: '📐' },
        { subject: 'IPAS / Sains', topic: 'Gaya di Sekitar Kita: Gesek, Gravitasi, Magnet', icon: '🧲' },
        { subject: 'IPAS / Sains', topic: 'Transformasi Energi: Kinetik, Potensial, Listrik', icon: '💡' },
        { subject: 'Bahasa Indonesia', topic: 'Cerita Fiksi, Majas Personifikasi & Menulis Puisi', icon: '📖' },
        { subject: 'IPAS / Sosial', topic: 'Indonesiaku Kaya Ragam Budaya & Peninggalan Sejarah', icon: '👑' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Pengukuran Sudut dengan Busur & Luas Persegi', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Macam Gaya Otot, Pegas, Gravitasi & Perubahan Energi', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Membedakan Puisi, Rima, dan Cerita Fiksi', icon: '📝' },
      ],
      pas: [
        { subject: 'PAT / PAS', topic: 'PAT: Ujian Kenaikan Kelas Matematika Diagram & Luas Bangun', icon: '🎯' },
        { subject: 'PAT IPAS', topic: 'PAT: Evaluasi Akhir Tahun Keragaman Budaya & Bentang Alam', icon: '🎯' },
      ],
    },
  },
  5: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Operasi Hitung Penjumlahan & Pengurangan Pecahan Campuran', icon: '➕' },
        { subject: 'IPAS / Sains', topic: 'Sifat Cahaya, Penglihatan Mata & Bunyi Telinga', icon: '🔦' },
        { subject: 'IPAS / Sains', topic: 'Harmoni dalam Ekosistem: Rantai & Jaring Makanan', icon: '🦅' },
        { subject: 'Bahasa Indonesia', topic: 'Teks Eksplanasi Fenomena Alam & Kata Baku', icon: '📄' },
        { subject: 'Pancasila / PPKn', topic: 'Nilai Juang Pancasila & Menghargai Keragaman Budaya', icon: '🇮🇩' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Penjumlahan Pecahan Beda Penyebut & Pecahan Desimal', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Rantai Makanan, Simbiosis & Sifat Perambatan Cahaya', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Struktur Teks Eksplanasi & Surat Undangan Resmi', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Matematika', topic: 'PAS: Perkalian Pecahan, Desimal, dan Kecepatan Debit', icon: '🎯' },
        { subject: 'PAS IPAS', topic: 'PAS: Penilaian Akhir Semester Organ Tubuh & Magnet Listrik', icon: '🎯' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Skala Peta, Perbandingan & Kecepatan Jarak Waktu', icon: '🗺️' },
        { subject: 'Matematika', topic: 'Volume Bangun Ruang Kubus & Balok (Jaring-Jaring)', icon: '📦' },
        { subject: 'IPAS / Sains', topic: 'Sistem Organ Pernapasan & Pencernaan Manusia', icon: '🫁' },
        { subject: 'IPAS / Sains', topic: 'Bumi dan Cuaca: Siklus Air & Bencana Alam', icon: '🌧️' },
        { subject: 'Bahasa Indonesia', topic: 'Teks Narasi Sejarah, Kosakata Serapan & Iklan', icon: '📰' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Menghitung Skala Denah & Volume Kubus/Balok', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Tahapan Siklus Air & Organ Pernapasan Paru-Paru', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Unsur Iklan Media Cetak & Kalimat Efektif', icon: '📝' },
      ],
      pas: [
        { subject: 'PAT / PAS', topic: 'PAT: Ujian Kenaikan Kelas Matematika Jaring Kubus & Statistik', icon: '🎯' },
        { subject: 'PAT IPAS', topic: 'PAT: Evaluasi Akhir Tahun Peristiwa Alam & Kesehatan Organ', icon: '🎯' },
      ],
    },
  },
  6: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Operasi Bilangan Bulat Negatif dan Positif', icon: '➕' },
        { subject: 'Matematika', topic: 'Lingkaran: Jari-Jari, Diameter, Keliling & Luas', icon: '⚪' },
        { subject: 'IPAS / Sains', topic: 'Perkembangbiakan Vegetatif & Generatif Hewan/Tumbuhan', icon: '🐝' },
        { subject: 'IPAS / Sains', topic: 'Rangka, Sendi, dan Otot Tubuh Manusia', icon: '🦴' },
        { subject: 'Pancasila / PPKn', topic: 'Penerapan Nilai Persatuan dalam Perbedaan Bangsa', icon: '🇮🇩' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Operasi Hitung Campuran Bilangan Bulat & Garis Bilangan', icon: '📝' },
        { subject: 'PTS Matematika', topic: 'PTS: Menghitung Keliling & Luas Lingkaran (Phi 22/7 & 3.14)', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Penyerbukan Bunga, Cangkok, Stek & Adaptasi Makhluk Hidup', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Teks Laporan Hasil Pengamatan & Kalimat Efektif', icon: '📝' },
      ],
      pas: [
        { subject: 'PAS Matematika', topic: 'PAS: Bilangan Bulat, Lingkaran & Pengenalan Bangun Ruang', icon: '🎯' },
        { subject: 'PAS IPAS', topic: 'PAS: Penilaian Akhir Semester Rangka Tubuh & Listrik Magnet', icon: '🎯' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Bangun Ruang: Tabung, Kerucut, Limas & Bola (Luas & Volume)', icon: '🧊' },
        { subject: 'Matematika', topic: 'Pengolahan Data Statistik: Mean, Median, Modus & Diagram', icon: '📊' },
        { subject: 'IPAS / Sains', topic: 'Sistem Tata Surya: Planet, Rotasi & Revolusi Bumi, Gerhana', icon: '🪐' },
        { subject: 'Bahasa Indonesia', topic: 'Teks Pidato Persuasif & Mengisi Formulir Ujian', icon: '🎙️' },
        { subject: 'Ujian Kelulusan', topic: 'Try Out Asesmen Standarisasi Sekolah Dasar (ASPD)', icon: '🎓' },
      ],
      pts: [
        { subject: 'PTS Matematika', topic: 'PTS: Volume Tabung & Kerucut serta Modus/Median Data', icon: '📝' },
        { subject: 'PTS IPAS', topic: 'PTS: Karakteristik Planet Tata Surya & Akibat Rotasi Bumi', icon: '📝' },
        { subject: 'PTS B. Indonesia', topic: 'PTS: Struktur Teks Pidato (Pembuka, Isi, Penutup)', icon: '📝' },
      ],
      pas: [
        { subject: 'Ujian Akhir SD', topic: 'Simulasi Ujian Sekolah Akhir Jenjang Matematika Lengkap', icon: '🏆' },
        { subject: 'Ujian Akhir SD', topic: 'Simulasi Ujian Sekolah Akhir Jenjang IPAS Lengkap', icon: '🏆' },
        { subject: 'Ujian Akhir SD', topic: 'Simulasi Ujian Sekolah Akhir Jenjang Bahasa Indonesia', icon: '🏆' },
      ],
    },
  },
  // SMP (Fase D - Kelas 7, 8, 9)
  7: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Bilangan Bulat, Pecahan & Operasi Hitung Rasional', icon: '🔢', levelTag: 'Fase D' },
        { subject: 'IPA', topic: 'Hakikat Ilmu Sains, Metode Ilmiah & Pengukuran Zat', icon: '🔬', levelTag: 'Fase D' },
        { subject: 'Bahasa Indonesia', topic: 'Menelaah Struktur Teks Deskripsi & Puisi Rakyat', icon: '📖', levelTag: 'Fase D' },
        { subject: 'Informatika', topic: 'Berpikir Komputasional & Algoritma Percabangan Dasar', icon: '💻', levelTag: 'Fase D' },
      ],
      pts: [
        { subject: 'PTS Terpadu SMP', topic: 'PTS: Bilangan Rasional & Wujud Zat Sains', icon: '📝', levelTag: 'Fase D' },
      ],
      pas: [
        { subject: 'PAS Terpadu SMP', topic: 'PAS: Asesmen Akhir Semester 1 Fase D Kelas 7', icon: '🎯', levelTag: 'Fase D' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Bentuk Aljabar, Persamaan Linier Satu Variabel & Rasio', icon: '📐', levelTag: 'Fase D' },
        { subject: 'IPA', topic: 'Klasifikasi Makhluk Hidup, Ekologi & Keanekaragaman Hayati', icon: '🌿', levelTag: 'Fase D' },
        { subject: 'Bahasa Inggris', topic: 'Describing People, Animals, and Daily Habits', icon: '🗣️', levelTag: 'Fase D' },
      ],
      pts: [
        { subject: 'PTS Terpadu SMP', topic: 'PTS: Aljabar Linier & Interaksi Antar-Komponen Ekosistem', icon: '📝', levelTag: 'Fase D' },
      ],
      pas: [
        { subject: 'PAT / Asesmen Akhir', topic: 'PAT: Ujian Kenaikan Kelas 7 Fase D Terpadu', icon: '🎯', levelTag: 'Fase D' },
      ],
    },
  },
  8: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Pola Bilangan, Barisan Konfigurasi Objek & Koordinat Kartesius', icon: '📈', levelTag: 'Fase D' },
        { subject: 'IPA', topic: 'Sistem Pencernaan, Peredaran Darah & Zat Aditif Makanan', icon: '🫀', levelTag: 'Fase D' },
        { subject: 'Bahasa Indonesia', topic: 'Teks Berita Eksplanatif & Menulis Iklan Slogan Poster', icon: '📰', levelTag: 'Fase D' },
      ],
      pts: [
        { subject: 'PTS SMP Kelas 8', topic: 'PTS: Barisan Aritmatika, Koordinat Kartesius & Nutrisi Tubuh', icon: '📝', levelTag: 'Fase D' },
      ],
      pas: [
        { subject: 'PAS SMP Kelas 8', topic: 'PAS: Asesmen Sumatif Semester 1 Kelas 8 SMP', icon: '🎯', levelTag: 'Fase D' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Teorema Pythagoras, Lingkaran & Garis Singgung Persekutuan', icon: '📐', levelTag: 'Fase D' },
        { subject: 'IPA', topic: 'Tekanan Zat (Pascal, Archimedes) & Getaran Gelombang Bunyi', icon: '🔊', levelTag: 'Fase D' },
      ],
      pts: [
        { subject: 'PTS SMP Kelas 8', topic: 'PTS: Teorema Pythagoras & Hukum Tekanan Cairan', icon: '📝', levelTag: 'Fase D' },
      ],
      pas: [
        { subject: 'PAT / Asesmen Akhir', topic: 'PAT: Ujian Kenaikan Kelas 8 Menuju Persiapan Kelas 9', icon: '🎯', levelTag: 'Fase D' },
      ],
    },
  },
  9: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Perpangkatan, Bentuk Akar & Persamaan Kuadrat', icon: '🔢', levelTag: 'Fase D' },
        { subject: 'IPA', topic: 'Sistem Reproduksi Manusia & Pewarisan Sifat Monohibrid/Dihibrid', icon: '🧬', levelTag: 'Fase D' },
        { subject: 'Bahasa Indonesia', topic: 'Teks Laporan Percobaan Ilmiah & Pidato Persuasif', icon: '🎙️', levelTag: 'Fase D' },
      ],
      pts: [
        { subject: 'PTS SMP Kelas 9', topic: 'PTS: Fungsi Kuadrat & Hukum Pewarisan Sifat Mendel', icon: '📝', levelTag: 'Fase D' },
      ],
      pas: [
        { subject: 'PAS SMP Kelas 9', topic: 'PAS: Penilaian Akhir Semester 1 Menuju Kelulusan SMP', icon: '🎯', levelTag: 'Fase D' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Kekongruenan, Kesebangunan Bangun Datar & Transformasi Geometri', icon: '📐', levelTag: 'Fase D' },
        { subject: 'IPA', topic: 'Kelistrikan Statis/Dinamis, Kemagnetan & Pemanfaatan Teknologi Ramah Lingkungan', icon: '⚡', levelTag: 'Fase D' },
        { subject: 'Kelulusan SMP', topic: 'Simulasi Try Out Ujian Sekolah Asesmen Standarisasi Akhir SMP', icon: '🎓', levelTag: 'Fase D' },
      ],
      pts: [
        { subject: 'PTS SMP Kelas 9', topic: 'PTS: Kesebangunan Segitiga & Rangkaian Listrik Ohm/Kirchhoff', icon: '📝', levelTag: 'Fase D' },
      ],
      pas: [
        { subject: 'Ujian Akhir SMP', topic: 'Simulasi Ujian Sekolah Lengkap Masuk SMA/SMK Favorit', icon: '🏆', levelTag: 'Fase D' },
      ],
    },
  },
  // SMA (Fase E/F - Kelas 10, 11, 12)
  10: {
    I: {
      regular: [
        { subject: 'Matematika', topic: 'Eksponen, Logaritma, Barisan & Deret Geometri', icon: '📈', levelTag: 'Fase E' },
        { subject: 'Fisika', topic: 'Pengukuran Vektor, Kinematika Gerak Lurus & Gerak Parabola', icon: '⚡', levelTag: 'Fase E' },
        { subject: 'Kimia', topic: 'Struktur Atom, Konfigurasi Elektron & Tabel Periodik Unsur', icon: '🧪', levelTag: 'Fase E' },
        { subject: 'Biologi', topic: 'Keanekaragaman Hayati, Struktur Virus & Peran Bakteri', icon: '🧬', levelTag: 'Fase E' },
      ],
      pts: [
        { subject: 'PTS SMA Kelas 10', topic: 'PTS: Eksponen Logaritma, Vektor Kinematika & Reaksi Kimia Dasar', icon: '📝', levelTag: 'Fase E' },
      ],
      pas: [
        { subject: 'PAS SMA Kelas 10', topic: 'PAS: Asesmen Sumatif Akhir Semester 1 Fase E', icon: '🎯', levelTag: 'Fase E' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika', topic: 'Sistem Persamaan Linier Tiga Variabel (SPLTV) & Trigonometri Dasar', icon: '📊', levelTag: 'Fase E' },
        { subject: 'Ekonomi', topic: 'Lembaga Jasa Keuangan, Bank Sentral & Manajemen Keuangan Pribadi', icon: '💰', levelTag: 'Fase E' },
        { subject: 'Sosiologi', topic: 'Interaksi Sosial, Identitas Diri & Lembaga Kemasyarakatan', icon: '👥', levelTag: 'Fase E' },
      ],
      pts: [
        { subject: 'PTS SMA Kelas 10', topic: 'PTS: Perbandingan Trigonometri Sudut Istimewa & Hukum Newton', icon: '📝', levelTag: 'Fase E' },
      ],
      pas: [
        { subject: 'PAT SMA Kelas 10', topic: 'PAT: Penilaian Akhir Tahun Kenaikan Menuju Peminatan Fase F', icon: '🎯', levelTag: 'Fase E' },
      ],
    },
  },
  11: {
    I: {
      regular: [
        { subject: 'Matematika Lanjut', topic: 'Komposisi Fungsi, Invers & Persamaan Polinomial (Suku Banyak)', icon: '📐', levelTag: 'Fase F' },
        { subject: 'Fisika', topic: 'Dinamika Rotasi, Kesetimbangan Benda Tegar & Fluida Dinamis', icon: '🌀', levelTag: 'Fase F' },
        { subject: 'Kimia', topic: 'Termokimia, Laju Reaksi & Kesetimbangan Kimia', icon: '🔥', levelTag: 'Fase F' },
      ],
      pts: [
        { subject: 'PTS SMA Kelas 11', topic: 'PTS: Polinomial Aljabar & Perhitungan Entalpi Termokimia', icon: '📝', levelTag: 'Fase F' },
      ],
      pas: [
        { subject: 'PAS SMA Kelas 11', topic: 'PAS: Evaluasi Sumatif Akhir Semester 1 Kelas 11 SMA', icon: '🎯', levelTag: 'Fase F' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika Lanjut', topic: 'Irisan Kerucut, Matriks Transformasi & Vektor Dimensi Tiga', icon: '🧮', levelTag: 'Fase F' },
        { subject: 'Fisika', topic: 'Termodinamika, Gelombang Mekanik & Alat Optik Teleskop/Mikroskop', icon: '🔭', levelTag: 'Fase F' },
      ],
      pts: [
        { subject: 'PTS SMA Kelas 11', topic: 'PTS: Determinan Matriks & Siklus Mesin Carnot', icon: '📝', levelTag: 'Fase F' },
      ],
      pas: [
        { subject: 'PAT SMA Kelas 11', topic: 'PAT: Evaluasi Akhir Tahun Kenaikan ke Kelas 12 Persiapan UTBK', icon: '🎯', levelTag: 'Fase F' },
      ],
    },
  },
  12: {
    I: {
      regular: [
        { subject: 'Matematika Lanjut', topic: 'Limit Fungsi Aljabar/Trigonometri & Turunan Pertama (Diferensial)', icon: '📈', levelTag: 'Fase F' },
        { subject: 'Fisika', topic: 'Rangkaian Arus Bolak-Balik (AC), Gelombang Elektromagnetik & Teori Relativitas Khusus', icon: '⚛️', levelTag: 'Fase F' },
        { subject: 'Persiapan Masuk PTN', topic: 'Drill Tes Potensi Skolastik (TPS) Penalaran Umum & Kuantitatif UTBK SNBT', icon: '🎯', levelTag: 'Fase F' },
      ],
      pts: [
        { subject: 'PTS SMA Kelas 12', topic: 'PTS: Kalkulus Diferensial & Reaksi Elektrokimia Sel Volta', icon: '📝', levelTag: 'Fase F' },
      ],
      pas: [
        { subject: 'PAS SMA Kelas 12', topic: 'PAS: Asesmen Akhir Semester Terpadu Kelas 12', icon: '🎯', levelTag: 'Fase F' },
      ],
    },
    II: {
      regular: [
        { subject: 'Matematika Lanjut', topic: 'Integral Tentu/Tak Tentu, Luas Daerah di Bawah Kurva & Volume Benda Putar', icon: '∫', levelTag: 'Fase F' },
        { subject: 'Persiapan SNBT', topic: 'Simulasi Akurat UTBK-SNBT: Literasi B. Indonesia, B. Inggris & Penalaran Matematika', icon: '🏆', levelTag: 'Fase F' },
        { subject: 'Ujian Kelulusan SMA', topic: 'Simulasi Ujian Sekolah Akhir Jenjang SMA Komprehensif', icon: '🎓', levelTag: 'Fase F' },
      ],
      pts: [
        { subject: 'Try Out Mandiri', topic: 'Try Out 1: Skolastik Kuantitatif & Penalaran Analitis SNBT', icon: '📝', levelTag: 'Fase F' },
      ],
      pas: [
        { subject: 'Final Try Out SNBT', topic: 'Final Grand Try Out: Persiapan Masuk PTN & Kedinasan Impian', icon: '🏆', levelTag: 'Fase F' },
      ],
    },
  },
};

// =========================================================================
// 2. CAMBRIDGE CAIE TOPICS (Primary, Lower Secondary, IGCSE & A-Level)
// =========================================================================
export const CAMBRIDGE_TOPICS: Partial<Record<string, Record<Semester, Record<ExamPeriod, TopicSuggestion[]>>>> = {
  '4': {
    I: {
      regular: [
        { subject: 'Cambridge Primary Math', topic: 'Cambridge Stage 4: Place Value, 4-Digit Addition & Multiplication', icon: '🔢', syllabusCode: '0096', levelTag: 'Primary Stage 4' },
        { subject: 'Cambridge Primary Science', topic: 'Cambridge Stage 4: Living Things in Environments & Sound Vibrations', icon: '🌱', syllabusCode: '0097', levelTag: 'Primary Stage 4' },
      ],
      pts: [{ subject: 'Progress Test', topic: 'Stage 4 Mid-Year Diagnostic Checkpoint', icon: '📝', levelTag: 'Primary Stage 4' }],
      pas: [{ subject: 'Progression Test', topic: 'End of Stage 4 Cambridge Primary Examination', icon: '🎯', levelTag: 'Primary Stage 4' }],
    },
    II: {
      regular: [
        { subject: 'Cambridge Primary Math', topic: 'Cambridge Stage 4: Fractions, Decimals, Perimeter & 2D Shapes', icon: '📐', syllabusCode: '0096', levelTag: 'Primary Stage 4' },
      ],
      pts: [{ subject: 'Progress Test', topic: 'Stage 4 Term 2 Diagnostic Assessment', icon: '📝', levelTag: 'Primary Stage 4' }],
      pas: [{ subject: 'Progression Test', topic: 'Cambridge Primary Stage 4 Annual Progression', icon: '🎯', levelTag: 'Primary Stage 4' }],
    },
  },
  '8': {
    I: {
      regular: [
        { subject: 'Mathematics (0862)', topic: 'Algebraic Expressions, Linear Equations & Formula Manipulation', icon: '📐', syllabusCode: '0862', levelTag: 'Stage 8' },
        { subject: 'Science (0893)', topic: 'Forces & Energy, Chemical Changes & Biological Cell Systems', icon: '🔬', syllabusCode: '0893', levelTag: 'Stage 8' },
        { subject: 'English (0861)', topic: 'Non-Fiction Text Analysis, Rhetorical Devices & Argumentative Writing', icon: '📚', syllabusCode: '0861', levelTag: 'Stage 8' },
      ],
      pts: [{ subject: 'Progress Test', topic: 'Mid-Stage 8 Checkpoint: Algebra, Indices & Energy Forms', icon: '📝', levelTag: 'Stage 8' }],
      pas: [{ subject: 'Progression Test', topic: 'Paper 1 & Paper 2 Comprehensive Lower Secondary Examination', icon: '🎯', levelTag: 'Stage 8' }],
    },
    II: {
      regular: [
        { subject: 'Mathematics (0862)', topic: 'Pythagorean Theorem, Probability & Compound Area of Circles', icon: '📏', syllabusCode: '0862', levelTag: 'Stage 8' },
        { subject: 'Science (0893)', topic: 'Light Rays, Sound Waves, Ecology & Periodic Table Trends', icon: '💡', syllabusCode: '0893', levelTag: 'Stage 8' },
      ],
      pts: [{ subject: 'Progress Test', topic: 'Diagnostic Mock: Geometric Proofs & Ray Diagrams', icon: '📝', levelTag: 'Stage 8' }],
      pas: [{ subject: 'Cambridge Checkpoint', topic: 'Official Stage 8 Progression Test Series', icon: '🎯', levelTag: 'Stage 8' }],
    },
  },
  '10': {
    I: {
      regular: [
        { subject: 'IGCSE Math (0580)', topic: 'Quadratic Curves, Coordinate Geometry & Trigonometric Bearings', icon: '📊', syllabusCode: '0580', levelTag: 'IGCSE Extended' },
        { subject: 'IGCSE Physics (0625)', topic: 'Thermal Physics, Gas Laws, Work Energy & Power Dynamics', icon: '⚡', syllabusCode: '0625', levelTag: 'IGCSE Paper 2/4' },
        { subject: 'IGCSE Chemistry (0620)', topic: 'Stoichiometry, Molar Volume, Electrolysis & Redox Titrations', icon: '🧪', syllabusCode: '0620', levelTag: 'IGCSE Paper 4' },
      ],
      pts: [{ subject: 'Term 1 Exam', topic: 'IGCSE Paper 2 (Multiple Choice Extended) Drill Test', icon: '📝', levelTag: 'IGCSE' }],
      pas: [{ subject: 'Mock Board Exam', topic: 'Full IGCSE Mock Paper 4 (Structured Theory Questions)', icon: '🎯', levelTag: 'IGCSE' }],
    },
    II: {
      regular: [
        { subject: 'IGCSE Math (0580)', topic: 'Differential Calculus Basics, Vectors in 2D & Matrix Transformations', icon: '📈', syllabusCode: '0580', levelTag: 'IGCSE Extended' },
      ],
      pts: [{ subject: 'Term 2 Exam', topic: 'Cumulative Revision: Transformations & Calculus Derivatives', icon: '📝', levelTag: 'IGCSE' }],
      pas: [{ subject: 'IGCSE Final Prep', topic: 'Past Paper Mastery: Paper 2 (Extended MCQ) & Paper 4 (Theory)', icon: '🎯', levelTag: 'IGCSE' }],
    },
  },
};

// =========================================================================
// 3. SINGAPORE MOE TOPICS (Primary PSLE, Secondary O-Level)
// =========================================================================
export const SINGAPORE_MOE_TOPICS: Partial<Record<string, Record<Semester, Record<ExamPeriod, TopicSuggestion[]>>>> = {
  '5': {
    I: {
      regular: [
        { subject: 'Singapore Math P5', topic: 'Bar Modeling: Fraction Word Problems & Unitary Method', icon: '📊', levelTag: 'Singapore MOE Primary 5' },
        { subject: 'Singapore Science P5', topic: 'Plant and Human Transport Systems & Water Cycle Cycles', icon: '💧', levelTag: 'Singapore MOE Primary 5' },
      ],
      pts: [{ subject: 'Term 1 Test', topic: 'Continual Assessment 1: Bar Modeling & Whole Numbers to 10 Million', icon: '📝', levelTag: 'Primary 5' }],
      pas: [{ subject: 'Semestral Assessment', topic: 'Mid-Year Semestral Assessment 1 Paper 1 & 2', icon: '🎯', levelTag: 'Primary 5' }],
    },
    II: {
      regular: [
        { subject: 'Singapore Math P5', topic: 'Percentage, Average, Triangles Area & Volume of Cubes/Cuboids', icon: '📐', levelTag: 'Singapore MOE Primary 5' },
      ],
      pts: [{ subject: 'Term 3 Test', topic: 'Continual Assessment 2: Rate and Percentage Problem Sums', icon: '📝', levelTag: 'Primary 5' }],
      pas: [{ subject: 'End of Year Exam', topic: 'Final Semestral Assessment 2 (P5 Benchmark)', icon: '🎯', levelTag: 'Primary 5' }],
    },
  },
  '6': {
    I: {
      regular: [
        { subject: 'Mathematics', topic: 'Advanced Bar Modeling: Part-Whole & Comparison Model Problem Sums', icon: '📊', levelTag: 'PSLE Foundation' },
        { subject: 'Mathematics', topic: 'Ratio, Speed, Distance & Simultaneous Fraction Heuristics', icon: '⏱️', levelTag: 'PSLE Standard' },
        { subject: 'Science', topic: 'Energy Conversion, Forces in Springs & Electrical Circuits', icon: '⚡', levelTag: 'PSLE Science' },
      ],
      pts: [{ subject: 'CA1 Assessment', topic: 'Continual Assessment 1: Fraction & Ratio Word Problems', icon: '📝', levelTag: 'PSLE Prep' }],
      pas: [{ subject: 'SA1 Mid-Year', topic: 'Semestral Assessment 1: Paper 1 (Speed Math) & Paper 2 (Word Problems)', icon: '🎯', levelTag: 'PSLE Prep' }],
    },
    II: {
      regular: [
        { subject: 'Mathematics', topic: 'Volume of Complex Prisms, Circles & Composite Figures Area', icon: '🧊', levelTag: 'PSLE Standard' },
      ],
      pts: [{ subject: 'Preliminary Exam', topic: 'School Prelim Paper 1 & 2: PSLE High-Order Thinking Skills', icon: '📝', levelTag: 'PSLE Final Sprint' }],
      pas: [{ subject: 'National PSLE', topic: 'Full PSLE Final Benchmark Examination Standard', icon: '🎯', levelTag: 'PSLE MOE' }],
    },
  },
};

// =========================================================================
// 4. INTERNATIONAL BACCALAUREATE (IB - PYP, MYP, DP)
// =========================================================================
export const IB_TOPICS: Partial<Record<string, Record<Semester, Record<ExamPeriod, TopicSuggestion[]>>>> = {
  '11': {
    I: {
      regular: [
        { subject: 'Math: Analysis & Approaches (AA)', topic: 'Functions, Polynomial Roots, Composite Functions & Calculus Limits', icon: '📈', levelTag: 'IB DP HL/SL' },
        { subject: 'Physics HL/SL', topic: 'Uncertainties and Error Propagation, Classical Mechanics & Momentum', icon: '⚛️', levelTag: 'IB DP Criterion A' },
        { subject: 'Economics HL/SL', topic: 'Competitive Markets: Demand & Supply Elasticities (PED, YED, XED)', icon: '💹', levelTag: 'IB DP Paper 1' },
      ],
      pts: [{ subject: 'Semester Exam', topic: 'Mid-Year Mock: Paper 1 (Non-Calculator) & Inquiry Essays', icon: '📝', levelTag: 'IB DP' }],
      pas: [{ subject: 'End of Year Exam', topic: 'Full DP 1 Board Papers with Official IB Command Terms', icon: '🎯', levelTag: 'IB DP' }],
    },
    II: {
      regular: [
        { subject: 'Math: Analysis & Approaches (AA)', topic: 'Derivatives of Trig Functions & Integral Calculus Applications', icon: '∫', levelTag: 'IB DP HL/SL' },
      ],
      pts: [{ subject: 'Quarterly Check', topic: 'Integration Techniques & Kinematics Modeling', icon: '📝', levelTag: 'IB DP' }],
      pas: [{ subject: 'DP1 Final Mock', topic: 'Official Paper 1 & Paper 2 (Graphic Display Calculator active)', icon: '🎯', levelTag: 'IB DP' }],
    },
  },
};

// =========================================================================
// 5. AMERICAN CURRICULUM TOPICS (Common Core, NGSS, AP Track)
// =========================================================================
export const AMERICAN_TOPICS: Partial<Record<string, Record<Semester, Record<ExamPeriod, TopicSuggestion[]>>>> = {
  '11': {
    I: {
      regular: [
        { subject: 'AP Calculus AB', topic: 'Limits, Continuity, Instantaneous Rate of Change & Derivative Rules', icon: '📐', levelTag: 'CollegeBoard AP' },
        { subject: 'AP US History', topic: 'Period 3 & 4: Revolutionary Era, Constitution, & Jacksonian Democracy', icon: '📜', levelTag: 'CollegeBoard AP' },
        { subject: 'NGSS High School Physics', topic: 'Forces, Momentum Conservation, Gravitational Fields & Orbital Motion', icon: '🌌', levelTag: 'NGSS Aligned' },
      ],
      pts: [{ subject: 'Quarter 1 Benchmark', topic: 'AP Multiple-Choice Section Practice (Part A - No Calculator)', icon: '📝', levelTag: 'AP Prep' }],
      pas: [{ subject: 'Semester 1 Final', topic: 'College Board Structured Free-Response Questions (FRQ) Drill', icon: '🎯', levelTag: 'AP Prep' }],
    },
    II: {
      regular: [
        { subject: 'AP Calculus AB', topic: 'Riemann Sums, Fundamental Theorem of Calculus & Area Between Curves', icon: '∫', levelTag: 'CollegeBoard AP' },
      ],
      pts: [{ subject: 'Quarter 3 Benchmark', topic: 'Definite Integrals & Differential Equations Slope Fields', icon: '📝', levelTag: 'AP Prep' }],
      pas: [{ subject: 'AP National Exam Mock', topic: 'Full 3-Hour AP Practice Exam (Section I MCQ + Section II FRQ)', icon: '🎯', levelTag: 'CollegeBoard AP' }],
    },
  },
};

/**
 * Dispatcher Topik Multi-Kurikulum Generasi Baru
 */
export function getCurriculumTopicsV2(
  curriculum: CurriculumType = 'merdeka',
  grade: GradeLevel,
  semester: Semester,
  period: ExamPeriod = 'regular'
): TopicSuggestion[] {
  const gKey = String(grade);

  let specificCatalog: Partial<Record<string, Record<Semester, Record<ExamPeriod, TopicSuggestion[]>>>> | null = null;
  if (curriculum === 'cambridge') specificCatalog = CAMBRIDGE_TOPICS;
  else if (curriculum === 'singapore' || (curriculum as any) === 'singapore_moe') specificCatalog = SINGAPORE_MOE_TOPICS;
  else if (curriculum === 'ib') specificCatalog = IB_TOPICS;
  else if (curriculum === 'american') specificCatalog = AMERICAN_TOPICS;

  if (specificCatalog && specificCatalog[gKey]) {
    const sem = specificCatalog[gKey]?.[semester];
    if (sem && sem[period] && sem[period].length > 0) {
      return sem[period];
    }
    if (sem && sem.regular && sem.regular.length > 0) {
      return sem.regular;
    }
  }

  // Jika kurikulum internasional belum memiliki katalog spesifik pada jenjang tertentu,
  // gunakan synthesizer kurikulum agar topik selalu relevan dengan kurikulum yang dipilih user!
  const synthesized = getSynthesizedCurriculumTopics(curriculum, grade, semester, period);
  if (synthesized && synthesized.length > 0) {
    return synthesized;
  }

  // Fallback ke master CURRICULUM_TOPICS (Kurikulum Merdeka & K-13 Nasional)
  const gradeData = CURRICULUM_TOPICS[grade];
  if (!gradeData) return [];
  const semData = gradeData[semester];
  if (!semData) return [];
  const periodData = semData[period];
  if (periodData && periodData.length > 0) {
    return periodData;
  }
  return semData.regular || [];
}

/**
 * Synthesizer Topik Kurikulum Internasional & Tematik untuk Seluruh Jenjang
 */
function getSynthesizedCurriculumTopics(
  curriculum: CurriculumType,
  grade: GradeLevel,
  semester: Semester,
  period: ExamPeriod
): TopicSuggestion[] | null {
  const isEarly = grade === 'pra-tk' || grade === 'tk' || grade === 'pra-sd';
  const gNum = typeof grade === 'number' ? grade : 0;
  const isPrimary = typeof grade === 'number' && grade >= 1 && grade <= 6;
  const isLowerSec = typeof grade === 'number' && grade >= 7 && grade <= 9;

  const periodPrefix = period === 'pts' ? 'PTS / Mid-Term: ' : period === 'pas' ? 'PAS / Board Exam: ' : '';

  switch (curriculum) {
    case 'cambridge': {
      if (isEarly) {
        return [
          { subject: 'Cambridge Early Years', topic: `${periodPrefix}Early Communication, Mathematics Exploring Numbers & Personal Well-being`, icon: '🧸', levelTag: 'Early Years' },
          { subject: 'Cambridge Creative Arts', topic: `${periodPrefix}Sensory Expressions, Physical Development & World Exploration`, icon: '🎨', levelTag: 'Early Years' },
        ];
      }
      if (isPrimary) {
        return [
          { subject: `Cambridge Primary Math Stage ${gNum}`, topic: `${periodPrefix}Stage ${gNum} Number & Calculation, Fractions, Decimals & Geometry`, icon: '📐', syllabusCode: '0096', levelTag: `Stage ${gNum}` },
          { subject: `Cambridge Primary Science Stage ${gNum}`, topic: `${periodPrefix}Stage ${gNum} Living Things, Forces & Materials Science`, icon: '🔬', syllabusCode: '0097', levelTag: `Stage ${gNum}` },
          { subject: `Cambridge Primary English Stage ${gNum}`, topic: `${periodPrefix}Stage ${gNum} Reading Comprehension, Grammar & Narrative Writing`, icon: '📖', syllabusCode: '0058', levelTag: `Stage ${gNum}` },
        ];
      }
      if (isLowerSec) {
        return [
          { subject: `Cambridge Lower Sec Math Stage ${gNum}`, topic: `${periodPrefix}Stage ${gNum} Algebraic Manipulation, Linear Equations & Statistics`, icon: '📊', syllabusCode: '0862', levelTag: `Stage ${gNum}` },
          { subject: `Cambridge Lower Sec Science Stage ${gNum}`, topic: `${periodPrefix}Stage ${gNum} Cell Biology, Chemical Bonding & Energy Transformations`, icon: '⚡', syllabusCode: '0893', levelTag: `Stage ${gNum}` },
        ];
      }
      return [
        { subject: 'Cambridge IGCSE / A-Level Math', topic: `${periodPrefix}Quadratic Functions, Coordinate Geometry, Trigonometry & Calculus`, icon: '📈', syllabusCode: '0580', levelTag: 'IGCSE Extended' },
        { subject: 'Cambridge IGCSE / A-Level Physics', topic: `${periodPrefix}Thermal Physics, Wave Mechanics, Electromagnetism & Atomic Physics`, icon: '⚛️', syllabusCode: '0625', levelTag: 'IGCSE Paper 2/4' },
      ];
    }

    case 'singapore':
    case 'singapore_moe' as any: {
      if (isEarly) {
        return [
          { subject: 'Singapore NEL Framework', topic: `${periodPrefix}Numeracy: Counting, Number Sense & Spatial Reasoning`, icon: '🔢', levelTag: 'NEL Kindergarten' },
          { subject: 'Discovery of the World', topic: `${periodPrefix}Sensory Inquiry & Environmental Awareness`, icon: '🌱', levelTag: 'NEL Kindergarten' },
        ];
      }
      if (isPrimary) {
        return [
          { subject: `Singapore Math Primary ${gNum}`, topic: `${periodPrefix}Bar Modeling: Part-Whole & Comparison Model Problem Sums`, icon: '📊', levelTag: `Singapore MOE P${gNum}` },
          { subject: `Singapore Math Heuristics P${gNum}`, topic: `${periodPrefix}Heuristics: Working Backwards, Restate Problem & Guess-and-Check`, icon: '🧮', levelTag: `Singapore MOE P${gNum}` },
          { subject: `Singapore Science P${gNum}`, topic: `${periodPrefix}Diversity, Cycles, Systems, Energy & Interactions in Nature`, icon: '💡', levelTag: `Singapore MOE P${gNum}` },
        ];
      }
      return [
        { subject: `Singapore Secondary Math Sec ${gNum - 6 || 1}`, topic: `${periodPrefix}Algebraic Fractions, Simultaneous Equations & Coordinate Geometry`, icon: '📐', levelTag: `Sec ${gNum - 6 || 1} Express` },
        { subject: 'O-Level Science / Add Math', topic: `${periodPrefix}Trigonometric Proofs, Quadratic Inequalities & Chemical Energetics`, icon: '⚡', levelTag: 'GCE O-Level' },
      ];
    }

    case 'ib': {
      if (isEarly || (isPrimary && gNum <= 5)) {
        return [
          { subject: 'IB Primary Years (PYP)', topic: `${periodPrefix}Unit of Inquiry: How We Organize Ourselves & Number Systems`, icon: '🌐', levelTag: 'IB PYP' },
          { subject: 'IB PYP Transdisciplinary', topic: `${periodPrefix}Inquiry: Sharing The Planet & Scientific Exploration`, icon: '🌱', levelTag: 'IB PYP' },
        ];
      }
      if (gNum <= 10) {
        return [
          { subject: 'IB Middle Years (MYP) Math', topic: `${periodPrefix}Criteria A-D: Pattern Exploration & Real-Life Mathematical Modeling`, icon: '📐', levelTag: 'IB MYP' },
          { subject: 'IB MYP Integrated Sciences', topic: `${periodPrefix}Criterion B-C: Scientific Investigations & Environmental Impacts`, icon: '🔬', levelTag: 'IB MYP' },
        ];
      }
      return [
        { subject: 'IB Diploma (DP) Math AA', topic: `${periodPrefix}Analysis & Approaches HL/SL: Calculus, Functions & Proofs`, icon: '📈', levelTag: 'IB DP HL/SL' },
        { subject: 'IB Diploma (DP) Physics/Chemistry', topic: `${periodPrefix}Mechanics, Thermal Energy, Atomic Orbitals & Internal Assessment`, icon: '⚛️', levelTag: 'IB DP Criterion A' },
      ];
    }

    case 'american': {
      if (isEarly) {
        return [
          { subject: 'Early Learning CCSS', topic: `${periodPrefix}Counting and Cardinality, Shapes & Foundational Reading`, icon: '🧸', levelTag: 'Pre-K & K' },
        ];
      }
      if (isPrimary) {
        return [
          { subject: `Common Core Math Grade ${gNum}`, topic: `${periodPrefix}Operations & Algebraic Thinking, Fractions & Measurement`, icon: '📐', levelTag: `CCSS Grade ${gNum}` },
          { subject: `NGSS Elementary Science Gr ${gNum}`, topic: `${periodPrefix}Earth Systems, Plant/Animal Structures & Energy Flow`, icon: '🌎', levelTag: `NGSS Grade ${gNum}` },
        ];
      }
      if (isLowerSec) {
        return [
          { subject: `Common Core Math Grade ${gNum}`, topic: `${periodPrefix}Ratios, Proportional Relationships & Expressions and Equations`, icon: '📊', levelTag: `CCSS Grade ${gNum}` },
          { subject: 'NGSS Middle School Physical Science', topic: `${periodPrefix}Forces and Interactions, Kinetic Energy & Waves`, icon: '⚡', levelTag: 'NGSS Middle School' },
        ];
      }
      return [
        { subject: 'AP Calculus / Algebra II Track', topic: `${periodPrefix}Derivatives, Instantaneous Rate of Change & CollegeBoard Drill`, icon: '📈', levelTag: 'CollegeBoard AP' },
        { subject: 'NGSS High School Physics/Chem', topic: `${periodPrefix}Newtonian Mechanics, Chemical Reactions & Nuclear Processes`, icon: '🧪', levelTag: 'NGSS High School' },
      ];
    }

    case 'edexcel': {
      if (isEarly || isPrimary) {
        return [
          { subject: `Pearson Edexcel iPrimary Math ${gNum || 1}`, topic: `${periodPrefix}Number, Calculations, Fractions, Decimals & Shapes`, icon: '🔢', levelTag: `iPrimary Year ${gNum || 1}` },
          { subject: `Pearson Edexcel iPrimary Science`, topic: `${periodPrefix}Life Processes, Materials & Physical Phenomena Investigation`, icon: '🔬', levelTag: `iPrimary Science` },
        ];
      }
      if (isLowerSec) {
        return [
          { subject: `Edexcel iLowerSecondary Math ${gNum}`, topic: `${periodPrefix}Algebra, Geometric Reasoning, Probability & Ratio Relations`, icon: '📐', levelTag: `iLowerSecondary Year ${gNum}` },
          { subject: `Edexcel iLowerSecondary Science`, topic: `${periodPrefix}Energy Resources, Chemical Reactions & Organisms`, icon: '⚡', levelTag: `iLowerSecondary Science` },
        ];
      }
      return [
        { subject: 'Pearson Edexcel IGCSE Math (4MA1)', topic: `${periodPrefix}Higher Tier: Calculus, Functions, Vector Geometry & Transformations`, icon: '📊', levelTag: 'Edexcel IGCSE 4MA1' },
        { subject: 'Edexcel IGCSE Physics / Chemistry', topic: `${periodPrefix}Forces, Thermal Physics, Radioactivity & Quantitative Chemistry`, icon: '🧪', levelTag: 'Edexcel IGCSE Paper 1' },
      ];
    }

    case 'montessori_ipc': {
      if (isEarly) {
        return [
          { subject: 'Montessori Sensorial & Math', topic: `${periodPrefix}Sensorial Exploration, Number Rods, Spindle Boxes & Practical Life`, icon: '🧸', levelTag: 'Montessori Early Years' },
          { subject: 'Montessori Cultural Exploration', topic: `${periodPrefix}Botany, Zoology, Sandpaper Globe & Living Things`, icon: '🌿', levelTag: 'Montessori Early Years' },
        ];
      }
      return [
        { subject: `IPC Thematic Unit (Milepost ${Math.min(3, Math.ceil((gNum || 1) / 2))})`, topic: `${periodPrefix}Active Planet, Brainwave, Saving The World & Inventions`, icon: '🌍', levelTag: `IPC Milepost ${Math.min(3, Math.ceil((gNum || 1) / 2))}` },
        { subject: 'IPC Inquiry & Creative Science', topic: `${periodPrefix}Hands-on Scientific Investigation & Community Collaboration`, icon: '🎨', levelTag: 'IPC Thematic' },
      ];
    }

    default:
      return null;
  }
}

/**
 * Adapter Kompatibilitas untuk Pemanggilan Lama
 */
export function getCurriculumTopics(
  grade: GradeLevel,
  semester: Semester,
  period: ExamPeriod = 'regular'
): TopicSuggestion[] {
  return getCurriculumTopicsV2('merdeka', grade, semester, period);
}
