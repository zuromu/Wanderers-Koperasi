# Changelog

Semua perubahan penting pada proyek ini dicatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

## [0.5.0], World polish

### Ditambahkan
- 16 pohon dekoratif pixel-art di tepi peta (batang, dua lapis daun, kilatan cahaya).
- Busa tepian air (foam) di setiap titik perbatasan air–daratan.
- Cerobong asap pada bangunan Kepala Desa.
- Bendera merah animasi (waving) di atas Kantor Koperasi.
- 10 partikel pollen melayang dengan variasi warna (biru muda, kuning, emas).
- Favicon SVG inline (lingkaran koperasi emas pada latar gelap).

## [0.4.0], Studio art overhaul

### Ditambahkan
- Font Google: Jersey 10 (HUD/judul) + Pixelify Sans (dialog/body); dimuat via `document.fonts.ready`.
- Sprite karakter pemain pixel-art prosedural (28×42 px, 2 frame: idle + jalan).
- Enam bangunan pixel-art prosedural: Pondok, Kantor Koperasi, Peti Bendahara, Ladang, Warung, Balai Desa.
- Partikel pollen melayang, bayangan awan bergerak, vignette.
- UI perkamen (parchment): gradient linen, border ganda emas + tinta, bayangan keras.
- Ikon SVG menggantikan semua emoji di HUD; tombol teks menggantikan emoji di seluruh kode.

### Dihapus
- Semua emoji dari kode sumber (UI, quest, dialog, state, quiz, demo).
- Efek glassmorphism (`backdrop-filter`) dari semua panel.

## [0.3.0], Accessibility & reach

### Ditambahkan
- Kontrol sentuh (D-pad + tombol aksi) untuk bermain di ponsel.
- Glosarium/bantuan istilah koperasi (tombol ❔ atau tombol H).
- Petunjuk awal (onboarding) saat pertama bermain.
- Penyesuaian tata letak responsif untuk layar sempit.

## [0.2.0], Education & proof-of-learning

### Ditambahkan
- Kuis mikro per-konsep (Simpanan Pokok, Modal, SHU) dengan opsi teracak,
  umpan balik benar/salah, dan pencatatan skor.
- Nilai literasi (A–D) + gelar (Anggota Teladan / Kader Koperasi / dst).
- Pilihan pinjam modal: KOPERASI vs RENTENIR (menampilkan selisih biaya).
- Rincian perhitungan SHU (jasa modal + jasa usaha) saat RAT.
- Layar Rapor akhir + Sertifikat Literasi Koperasi yang bisa diunduh (PNG).
- Input nama pemain di layar judul (untuk sertifikat).
- Mode Demo Otomatis (~60 dtk) untuk juri: memutar seluruh siklus tanpa input.

## [0.1.0], MVP

### Ditambahkan
- Dunia desa berbasis grid dengan gerakan pemain (panah / WASD) dan tabrakan.
- Enam lokasi interaktif: Kepala Desa, Kantor Koperasi, Bendahara, Ladang,
  Pasar, dan Balai Desa (RAT).
- Siklus koperasi utuh sebagai misi berurutan:
  daftar → Simpanan Pokok → pinjam modal → tani → jual panen → lunasi → RAT → SHU.
- State machine `switch/case` untuk misi (`questInfo`) dan interaksi (`interact`).
- HUD (uang, simpanan, panen, status anggota) + papan misi + penanda tujuan.
- Sistem dialog dengan pilihan dan validasi saldo.
- Struktur kode modular (ES Modules) + konfigurasi deploy Vercel.

### Rencana berikutnya
Lihat bagian **Roadmap** di `README.md`.
