# Panduan Kontribusi

Terima kasih ingin ikut mengembangkan **Wanderer's Koperasi Quest**! Dokumen ini
menjelaskan struktur proyek agar mudah ditambah fitur baru.

## Menjalankan secara lokal

Proyek ini memakai ES Modules, jadi **harus lewat server** (tidak bisa buka
`index.html` langsung via `file://`).

```bash
npm install      # sekali saja (mengambil paket 'serve')
npm run dev      # buka URL yang ditampilkan, biasanya http://localhost:3000
```

Alternatif tanpa Node:

```bash
python3 -m http.server 8123   # lalu buka http://localhost:8123
```

## Struktur kode

```
index.html        # kerangka halaman + memuat Phaser (CDN) dan src/main.js
src/
  styles.css      # seluruh gaya tampilan
  data.js         # data dunia: peta, lokasi (SPOTS), konstanta — TANPA logika
  state.js        # state pemain (S) + state machine misi questInfo() [switch/case]
  quest.js        # logika koperasi interact() [switch/case] — inti edukasi
  ui.js           # kotak dialog, HUD, papan misi
  scene.js        # scene Phaser: gambar peta, gerakan, input
  main.js         # boot Phaser
```

Aliran data: `scene` menangkap input → memanggil `quest.interact()` → mengubah
`state.S` → memanggil `ui.refresh()` untuk memperbarui tampilan.

## Cara menambah fitur umum

- **NPC / lokasi baru**: tambah entri di `SPOTS` (`src/data.js`), lalu tangani
  `id`-nya di `switch` pada `interact()` (`src/quest.js`).
- **Tahap misi baru**: tambah `case` di `questInfo()` (`src/state.js`) dan atur
  perpindahan `S.stage` di `quest.js`.
- **Ubah peta**: edit array `MAP` di `src/data.js` (0=rumput, 1=jalan, 2=penghalang).

## Gaya penulisan

- Bahasa Indonesia untuk teks yang dilihat pemain dan komentar penjelas.
- Jaga logika game tetap di state machine `switch/case` agar mudah dibaca juri.
- Satu modul = satu tanggung jawab (data / logika / tampilan terpisah).
