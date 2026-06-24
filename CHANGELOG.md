# Changelog

Semua perubahan penting pada proyek ini dicatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

## [0.51.0], Distinct NPC sprites — 7 unique characters with own appearance

### Diubah
- **Sprite NPC unik per karakter**: setiap dari 7 warga desa kini memiliki tampilan khas yang berbeda:
  - **Pak Darmo** — baju olive green, rambut putih/abu (lanjut usia), celana abu gelap
  - **Bu Siti** — baju pink/magenta, kerudung merah gelap menutup kepala
  - **Dodi** — baju biru cerah, celana navy, rambut pendek tanpa topi (anak kecil)
  - **Ratna** — baju jade green, rambut cokelat gelap dengan bunga merah muda di rambut
  - **Pak Hasan** — baju navy gelap, topi caping jerami/rotan, warna kulit lebih gelap
  - **Bu Lastri** — baju ungu formal, sanggul rapi, kacamata bulat kecil
  - **Rudi** — baju oranye, celana jeans biru, topi baseball biru
- Setiap NPC memiliki satu texture unik (`npc_darmo`, `npc_siti`, dst.) — tidak ada lagi 6 varian warna generik yang berulang

## [0.50.0], Cliff edges + title screen polish — map borders, reed beds, varied particles

### Ditambahkan
- **Tebing batu utara**: baris batu berlapis di tepi atas baris 1 (berbatasan dengan air) — shadow gelap, strata batu, lumut hijau, dan batu menonjol sesekali; dunia tidak lagi berakhir dengan tepi air yang terpotong tiba-tiba.
- **Alang-alang selatan**: deretan alang-alang cokelat dengan kepala biji cattail di batas bawah baris 12 (berbatasan dengan air baris 13) — menciptakan nuansa tepi sungai/danau yang natural.
- **Tebing sisi barat & timur**: garis batu tipis di batas kiri dan kanan peta untuk konsistensi visual keempat sisi.
- **Batu tepi pantai wave-49**: hasil `drawShoreline()` dari wave sebelumnya kini bekerja bersama tebing untuk menciptakan ekosistem tepi air yang kohesif.

### Diubah
- **Partikel judul lebih hidup**: 36 partikel (vs 28) dengan tiga varian — gold sparks, drifting sideways (melayang sisi), dan twinkle bintang putih-krem — layar judul terasa lebih bernyawa tanpa distraksi berlebihan.

## [0.49.0], NPC identity + world micro-detail — named villagers, shoreline, building props

### Ditambahkan
- **Warga desa bernama**: 7 NPC kini memiliki nama unik (Pak Darmo, Bu Siti, Dodi, Ratna, Pak Hasan, Bu Lastri, Rudi) dengan ukuran yang berbeda-beda (anak kecil 0.82×, tua 1.08×) — bubble nama muncul saat pemain mendekat dan dialog menampilkan nama + portrait yang sesuai.
- **NPC menghadap pemain**: saat pemain dalam jangkauan bicara, setiap NPC secara otomatis membalik sprite-nya menghadap pemain — interaksi terasa lebih alami dan responsif.
- **Batu tepi pantai (shoreline rocks)**: batu-batu kecil berkilau tersebar di seluruh tepi air (water tiles bersebelahan dengan daratan) — transisi air-darat tidak lagi terpotong abrupt, memberikan nuansa pantai/sungai yang natural.
- **Kotak bunga + jemuran di cottage**: Kepala Desa kini punya kotak bunga merah-putih-kuning di bawah jendela dan tali jemuran dengan baju berwarna di sisi rumah — micro-detail yang membuat dunia terasa dihuni.
- **Pot tanaman di Koperasi**: dua pot merah dengan tanaman hijau di sisi pintu Kantor Koperasi — menambah atmosfer bangunan publik yang terawat.
- **Portrait per NPC di BADGE_MAP**: semua 7 nama NPC terdaftar di BADGE_MAP dengan portrait warga desa dan warna tema unik masing-masing.

## [0.48.0], Character identity + ambient life — scarf, cloud pulse, shimmer animation

### Ditambahkan
- **Syal wanderer**: karakter pemain kini mengenakan syal merah-oranye di leher (terlihat dari depan sebagai dua ujung juntai, dari belakang sebagai kain melilit) — memberikan visual identity yang khas dan mudah dikenali sebelum dialog dimulai.
- **Denyut cahaya ambient**: overlay samar (alpha maks 0.028) berosilasi setiap ~12 detik di seluruh layar mensimulasikan bayangan awan tipis yang melintas — dunia terasa bernapas tanpa efek berlebihan.
- **Kilatan air beranimasi**: lapisan shimmer di permukaan air (garis-garis cahaya) kini perlahan-lahan berdenyut (alpha 0.1–1.0, periode ~16 detik) — air kini terlihat berkilau dinamis seperti sungai/danau sungguhan.

## [0.47.0], World props — lamp posts, market stalls, rice paddy, milestone stones

### Ditambahkan
- **Tiang lampu jalan**: 4 lampu jalan dengan lentera keemasan di persimpangan jalur utama (row 5 & 10, col 9 & 11) — berkedip sinkron dengan sistem `windowGlows`, memberi kesan kota desa yang tertata.
- **Kios pasar**: 2 kios dengan atap segitiga berwarna (merah & biru) di sisi kiri-kanan bangunan Pasar, lengkap dengan meja kayu dan tumpukan barang berwarna-warni — area pasar kini terasa hidup seperti pasar desa sesungguhnya.
- **Barisan padi**: Deretan tanaman padi kecil (4×7 grid) di area timur Ladang — segitiga daun dan batang hijau berlapis mencerminkan sawah yang siap panen.
- **Batu petunjuk jalan**: 2 tanda batu kecil berbentuk pilar di ujung jalur selatan (dekat ladang dan pasar) — detail kecil yang membuat dunia terasa seperti peta RPG sungguhan, bukan grid kosong.

## [0.46.0], Game feel — movement squish, money drain, triple confetti, banner wipe, mobile d-pad

### Diubah
- **Anticipation movement**: setiap langkah pemain kini diawali pre-squish 40ms (scaleY 0.82, scaleX 1.12) sebelum bergerak, lalu stretch (scaleY 1.08) saat mendarat — bukan lagi piece yang bergeser di grid datar.
- **Money drain lebih berasa**: pengeluaran uang kini disertai flash merah (0xdd3333), kamera shake lebih kuat (0.006 × 180ms), dan 7 percikan merah gelap — pengeluaran terasa berbeda dari pemasukan.
- **Tiga gelombang konfeti**: layar kemenangan kini menembakkan konfeti tiga kali (center t=0, kiri t=600ms, kanan t=1200ms) + dua flash putih (t=400ms, t=900ms) — 4 detik pertama dikunci agar pemain tidak berjalan di tengah fanfare.
- **Win-glow 3× loop**: animasi emas di border kanvas sekarang diputar 3 kali (bukan 1) sehingga terasa seperti momen kemenangan, bukan kedip sekilas.
- **Stage banner wipe**: banner tidak lagi fade-in dari posisi tetap, melainkan muncul horizontal dari kiri dengan `Back.easeOut` (380ms) disertai flash+shake saat masuk, dan bertahan 2200ms (dari 1700ms).
- **D-pad mobile lebih besar**: tombol arah naik dari 46px ke 50px, tombol Aksi tengah naik ke 54px dengan ring emas `gold-dark` — memenuhi standar minimum touch target pada layar kecil.

## [0.45.0], World rendering — ground gradient, depth sorting, torch flame, bird flap, hint visibility

### Diubah
- **Gradien cahaya lapangan**: warna tanah kini memiliki gradien arah top-left→bottom-right (luminance 0.05–0.35 vs flat random 0–0.3) — lapangan tampak seperti diterangi matahari dari kanan atas, bukan noise static.
- **Depth sorting perspektif**: pemain dan NPC kini memperbarui `depth` tiap frame berdasarkan posisi Y (`2.5 + y/560*4`) — karakter yang lebih jauh (atas layar) otomatis berada di belakang karakter yang lebih dekat (bawah layar), termasuk bangunan di kedalaman 3.
- **Api obor teardrop**: dua lingkaran oranye diganti dengan segitiga bertumpuk (oranye luar → kuning tengah) plus titik bara merah di pangkal — tampak seperti api nyata bukan LED bulat.
- **Radius glow obor lebih proporsional**: radius lingkaran ambient turun dari 18+v*8 ke 12+v*5 — selaras dengan ukuran api teardrop baru.
- **Bird flap dibalik**: animasi sayap burung dikoreksi dari "mengecil ke atas" (scaleY 0.55–1.1) ke "glide-to-fold" (scaleY 1.0–0.5) — sayap kini terlipat ke bawah saat kepak, bukan seluruh sprite mengecil.
- **Indikator interaksi lebih terlihat**: alpha cincin emas naik dari 0.14–0.38 ke 0.25–0.65; tambah highlight putih kecil di tengah; teks dari `'[ SPASI ]'` 7px ke `'SPASI ▶'` 9px berwarna emas.
- **Gelembung NPC lebih ramah**: teks `'...'` diganti `'Bicara?'`; font naik dari 9px ke 10px; gelembung kini muncul dengan animasi pop-in scale 0.5→1.0 (`Back.easeOut`).

## [0.44.0], UI legibility — bigger portraits, SVG arrow, button hierarchy, semantic disabled

### Diubah
- **Portrait 48×48px**: potret dialog naik dari 30px ke 48px (36px mobile) — wajah karakter kini terbaca jelas di header dialog, bukan thumbnail cilik.
- **Badge dihapus saat portrait ada**: header dialog tidak lagi menampilkan badge huruf kecil di samping portrait — lebih bersih, hierarki lebih jelas.
- **Dialog arrow SVG**: panah lanjut (`▼`) diganti chevron SVG rounded yang terpusat — selaras dengan gaya visual RPG studio.
- **Bounce lebih ekspresif**: animasi bounce arrow naik dari 4px ke 6px.
- **Hierarki 3 tombol judul**: tombol Utama (48×32, text 17px, drop-shadow emas), Sekunder (18×8, text 14px), Tersier "Tentang" (underline only, opacity 0.7) — tidak lagi tiga tombol dengan bobot visual sama.
- **Disabled button semantic**: tombol tidak terpenuhi syarat kini memakai `data-disabled` + `aria-disabled` + `pointer-events:none` — bukan inline style sniffing.
- **Quest bar lebih tebal**: progress bar naik dari 4px ke 7px, background lebih gelap (0.22), label misi naik dari 10px ke 11px dengan letter-spacing — lebih terlihat di layar kecil.

## [0.43.0], Audio overhaul — noise percussion, footsteps, drift-free music

### Diubah
- **Click/pop dihilangkan**: `blip()` kini pakai linear attack ramp (15ms sine / 3ms lainnya) sebelum sustain — tidak ada lagi artifak zipper di setiap nada dan SFX.
- **Hihat berbasis noise**: hihat sebelumnya adalah osilator square 3200Hz (terdengar seperti peluit), kini diganti buffer white-noise → highpass 7kHz → decay 40ms — terdengar seperti simbal sesungguhnya.
- **Kick dengan transient click**: kick kini diawali osilator sine 3kHz yang decay 10ms (snap awal) diikuti pitch-sweep body 120→0Hz — terdengar punchy bukan berdengung.
- **Footstep berbasis noise**: `stepGrass` dan `stepPath` kini menggunakan burst noise terfilter (lowpass 300Hz untuk rumput, bandpass 1800Hz untuk jalan) dengan playback-rate acak ±10% — langkah kaki terasa nyata, bukan nada musik.
- **Musik drift-free**: scheduler diganti dari `setInterval` ke `setTimeout` self-rescheduling dengan lookahead 50ms — timing musik stabil tidak bergeser. Setiap 16 beat (4 bar) beralih antara MELODY_A dan MELODY_B (naik satu semitone), beat 4 & 12 tanpa kick di bar B, 15% probabilitas rest acak per nada — musik terasa lebih organik dan tidak robotik.

## [0.42.0], Quiz portraits + NPC tip variety

### Ditambahkan
- **Portrait kuis**: `Kuis Koperasi` (biru tanda tanya), `Benar!` (hijau centang lingkaran), `Kurang Tepat` (merah silang lingkaran) kini punya portrait 30×30 masing-masing — tidak ada lagi speaker tanpa wajah di seluruh alur game.
- **14 tips NPC** (dari 7): warga desa kini berbagi fakta koperasi yang lebih beragam — perbedaan simpanan vs aset, bahaya rentenir, KUD, lambang koperasi, koperasi siswa, dan referensi UU No.25/1992.

## [0.41.0], Dialogue portraits — pixel-art speaker faces per NPC/location

### Ditambahkan
- **Potret dialog per pembicara**: setiap dialog kini menampilkan ikon portrait 30×30px pixel-art unik di header — Kepala Desa dengan peci hitam, Bendahara dengan kacamata emas, petani bertopi bambu, pedagang berblangkon oranye, gedung koperasi, balai desa, sumur, Wanderer berkerudung dengan mata ungu, dll. — membuat percakapan terasa seperti RPG studio AAA sesungguhnya.
- **CSS `.dlg-portrait`**: portrait dibingkai dengan border-radius 4px, drop-shadow, dan highlight tepi atas — tampak seperti kartu karakter profesional di dalam panel dialog.

## [0.40.0], Studio living world — bird silhouettes, window glows, tile blending, butterflies

### Ditambahkan
- **Siluet burung kepak sayap**: 8 burung kini menggunakan tekstur siluet V-shape (lineBetween 4 segmen) yang membentuk formasi-V longgar, masing-masing kepak sayap secara asinkron (scaleY 0.55–1.10 per burung) — bukan lagi titik hitam yang meluncur datar.
- **Cahaya jendela berkedip**: cottage dan balai desa kini memiliki persegi panjang cahaya amber (0xffdd88) yang perlahan berdenyut di dalam kaca jendela (alpha ±0.28 per detik) — mensimulasikan lilin atau orang yang lewat di dalam ruangan.
- **Transisi tepi petak halus**: zona 6px di perbatasan rumput-jalan kini diberi warna tengah (lerp 50%) dengan alpha 0.35, menghilangkan tepi kotak yang tajam — dunia tampak menyatu dan organik, bukan tile-grid yang terlihat jelas.
- **Asap cerobong mengembang**: asap cottage kini mulai kecil (scale 0.55) dan membesar hingga 2.95× saat naik, lalu memudar — mirip asap nyata yang mengembang di udara, bukan lingkaran kecil yang bergerak lurus.
- **Kupu-kupu ambien**: 4 kupu-kupu monarch oranye melayang di area rumput, sayap membuka-menutup (scaleX 0.22–1.0) dengan pola terbang figure-eight berlapis — detail kecil yang membuat dunia terasa penuh kehidupan.
- **Asap lebih lebat**: jumlah partikel asap naik dari 5 ke 8 dengan radius sedikit lebih besar — cerobong cottage terlihat aktif sepanjang waktu.

## [0.39.0], Ambient life — fireflies, NPC bubbles, detailed lily pads

### Ditambahkan
- **Kunang-kunang**: 9 titik kuning kecil melayang di dekat pohon-pohon tepi peta, kecerahannya berdenyut perlahan (0–60% alpha, 2.2 dtk/siklus) sambil mendeskripsikan jalur elips kecil — dunia terasa hidup bahkan di malam hari.
- **Gelembung pendekatan NPC**: saat pemain berada dalam 1 ubin dari warga desa, gelembung "..." muncul di atas mereka (fade-in 240ms, slide dari y=-36 ke y=-42) — tanda RPG klasik bahwa ada sesuatu untuk dikatakan.
- **Teratai lebih detail**: bayangan di bawah bantalan, highlight hijau muda, serat/vena daun (3 garis), dan bunga 3-lapis (mahkota luar merah muda + dalam oranye + kepala sari kuning + specular) menggantikan dua elips datar sebelumnya.

## [0.38.0], Game feel — torch glow, stage banners, puddles, character blink

### Ditambahkan
- **Cahaya obor dinamis**: saat pemain berada dalam ~80px dari obor, sprite karakter mendapat tint emas hangat (R:255, G turun 55, B turun 138) proporsional ke jarak — efek pencahayaan nyata real-time tanpa shader.
- **Banner tahap misi**: saat misi berubah fase (LOAN/PLANT/SELL/REPAY/RAT/DONE), banner full-width muncul dengan animasi slide-up + fade, garis emas atas-bawah, dan teks besar emas — terasa seperti cutscene RPG studio.
- **Genangan jalan**: ~5% tile jalan memiliki genangan kecil semi-transparan (ellips 10-17px, alpha 0.19) dengan highlight putih — detail "dunia hidup" yang ada di game storybook.
- **Kedipan mata karakter**: setiap 3.2–7.6 detik, karakter pemain menutup mata (texture `char_blink`) selama 105ms lalu kembali ke idle — detail animasi yang biasanya hanya ada di game AAA.

## [0.37.0], Studio polish — music percussion, ambient chirps, NPC walk bounce, well detail

### Ditambahkan
- **Perkusi musik**: kick drum sinus (120Hz exponential decay) dan hi-hat square wave pendek masuk ke loop musik latar — memberi groove seperti RPG studio sungguhan.
- **Suara burung ambient**: `chirp` berdurasi acak (880-1100Hz, 5 nada triangle) dijadwalkan ulang setiap 7-18 detik — dunia sekarang terasa hidup bahkan saat berdiam.
- **Pantul langkah NPC**: setiap kali warga desa berjalan, sprite-nya melakukan squish-stretch scaleY (0.90→1.04→1.04→0.90) selama 550ms — tidak ada lagi NPC yang "melayang" antar tile.
- **Sumur lebih detail**: bibir batu bersusun 3 bagian dengan highlight, lumut sisi, pantulan air di dalam lubang, tali zigzag, dan gagang ember berbentuk U — menggantikan lingkaran batu tunggal yang datar.

## [0.36.0], Living world — field redesign, vault building, NPC variety, interaction hints

### Ditambahkan
- **Ladang sawah realistis**: menggantikan 3 baris titik hijau dengan baris tanah subur, saluran irigasi biru antar baris, tanaman padi bergambar (batang + daun miring + bulir gabah), pagar dua sisi, dan orang-orangan sawah dengan topi — tampilan studio indie yang sesungguhnya.
- **Gedung kas brankas**: Bendahara kini digambarkan sebagai gedung batu dengan pedimen, entablatur, pintu brankas melengkung (baut + lubang kunci + bayangan tebal), dan koin emas di dasar — jauh lebih tepat secara naratif daripada peti harta.
- **Variasi idle NPC**: 7 NPC kini memiliki 3 tipe animasi diam — *bob* (naik-turun), *sway* (napas/skala bernapas), dan *rock* (goyang rotasi ±3°) — masing-masing terlihat lebih hidup dan berbeda kepribadian.
- **Suara langkah bertile**: berjalan di jalan batu berbunyi `stepPath` (ketukan nyaring) sedangkan di rumput berbunyi `stepGrass` (pukulan lembut sinus) — detail audio yang hanya ada di game studio besar.
- **Indikator interaksi proksimiti**: saat pemain berada dalam 1 ubin dari bangunan, cincin emas berdenyut muncul di bawah bangunan dan label `[ SPASI ]` melayang-layang di atasnya — sinyal interaktivitas yang segera terbaca tanpa HUD.

## [0.35.0], World richness — water shimmer, roof shingles, ambient occlusion

### Ditambahkan
- **Kilatan air statis** (`drawWaterShimmer`): 2-4 garis cahaya diagonal per petak air (depth 1.05) memberikan tekstur permukaan air bahkan sebelum animasi warna dimulai.
- **Sirap atap**: garis horizontal halus di atap Kepala Desa, pedimen Koperasi, pedimen Balai Desa, dan kanopi Pasar — setiap bangunan kini terlihat punya material atap yang nyata.
- **Ambient occlusion bangunan**: pita bayangan gelap tipis di dasar setiap bangunan menambah kedalaman dan kesan "terpasang di tanah."
- **Retak batu jalan**: ~12% petak jalan memiliki satu garis retak halus yang mensimulasikan keausan alami (tampilan dunia yang sudah lama ada).

## [0.34.0], Premium UI — speaker badges, dialogue polish, quest panel

### Ditambahkan
- **Speaker badge berwarna**: setiap NPC/lokasi kini memiliki lencana bulat berwarna di header dialog (Kepala Desa=coklat, Koperasi=biru, Bendahara=emas, Ladang=hijau, Pasar=oranye, Balai Desa=ungu, dll.) — tampilan profesional seperti RPG studio.
- **Tombol pilihan dengan aksen**: choice button mendapat `border-left:4px` yang berubah warna saat hover, memberikan affordance visual yang lebih jelas.
- **Header dialog bergradien** lebih kaya (3 titik warna emas) dengan badge terintegrasi di flexbox.
- **Area teks dialog** mendapat subtle gradient latar dan `line-height:1.6` untuk keterbacaan lebih baik.
- **Panel misi** mendapat garis vertikal emas `::before` di sebelah kiri judul misi — tanda visual yang elegan.
- **Hint bar** dialog mendapat separator tipis di atas.

## [0.33.0], Character polish — walk cycle, footstep dust, name tag

### Ditambahkan
- **Walk cycle 6-frame**: karakter pemain kini memiliki 6 tekstur (`char_i`, `char_wL`, `char_wR`, `char_u`, `char_uL`, `char_uR`) — setiap langkah mengalternasi kaki kiri/kanan yang terlihat bergerak.
- **Karakter lebih detail**: kerah V, ikat pinggang emas, manset lengan, alis mata, hidung kecil, bayangan sisi wajah & badan, highlight rambut berlapis — mendekati kualitas studio indie.
- **Debu jejak kaki**: setiap langkah meledakkan 3 partikel debu kecil di posisi lama (warna sesuai tile: pasir di jalan, hijau di rumput).
- **Tag nama pemain**: setelah masuk game, nama yang diketik di layar judul muncul sebagai label kecil di atas kepala karakter.
- Import `S` ke scene.js untuk akses nama pemain.

## [0.32.0], Depth & ambience — grass tufts, props, vertical sky lighting

### Ditambahkan
- **Rumput panjang tepi air** (`drawGrassTufts`): bilah-bilah rumput pendek berwarna-warni muncul di setiap petak rumput yang berbatasan dengan air, memberikan transisi alami khas RPG profesional.
- **Prop dekoratif ambien** (`drawPropsDecor`): tong kayu & peti di Pasar, bangku batu di Balai Desa, koin berserakan di sekitar Bendahara — menjadikan dunia terasa dihuni dan terperinci.
- **Pencahayaan vertikal langit** (`makeAtmosphere`): gradien linear atas (terang, hangat) ke bawah (gelap, dingin) ditambahkan ke overlay atmosfer, memberikan kedalaman volumetrik khas game AAA.
- **Scanline overlay tipis** pada `#game` via CSS `::after` (opacity ~1,8%) untuk nuansa pixel-art yang terasa lebih intentional.
- Barrel dan crate memiliki highlight serat kayu, bangku batu memiliki highlight top bevel.

## [0.31.0], Studio art pass — cobblestones, atmospheric lighting, richer detail

### Ditambahkan
- **Cobblestone paths**: setiap petak jalan kini menampilkan 4 batu paving individual bervariasi warna dan posisi, menggantikan garis silang tipis. Tampilan jalan jauh lebih hidup.
- **Cahaya jendela hangat**: bangunan (Kepala Desa, Balai Desa) kini memiliki jendela bercahaya kuning-amber yang mensimulasikan interior yang hangat.
- **Overlay atmosfer direksinoal**: gradien cahaya matahari halus dari kanan atas (kuning-oranye) + bayangan sejuk dari kiri bawah (biru) memberikan kedalaman warna seperti studio AAA.
- **Foliage 5 lapis**: pohon kini memiliki 5 layer warna (bayangan bawah → massa utama → kluster cerah → sisi → specular highlight), jauh lebih kaya dari sebelumnya.
- **Scalloped market canopy**: kanopi Pasar mendapat rumbai scallop teal bergantian di ujung bawah.
- **Bendera merah-putih**: tiang Kantor Koperasi kini mengibarkan bendera merah-putih 2 warna.
- **NPC sprites diperkaya**: rambut muncul di bawah topi, ikat pinggang dengan gesper emas, mata dengan sorotan cahaya putih, sepatu lebih detail.
- **Buah beri semak**: semak dekoratif (~35%) kini memiliki kluster beri merah/oranye kecil.
- **Papan nama koperasi**: tanda kecil emas di atas pintu Kantor Koperasi.
- **Jendela Balai Desa**: dua jendela bercahaya hangat di sisi pintu.
- **Bayangan bangunan searah cahaya**: offset ke kiri-bawah sesuai sumber cahaya dari kanan atas.
- **CSS premium**: background body gradient gelap + glow emas pada judul, chip HUD mendapat inner highlight, kbd style lebih terdefinisi.

## [0.30.0], Falling leaves, NPC size variety, double-frame border

### Ditambahkan
- **Daun berguguran** (`makeLeaves()`): partikel daun hijau/kuning/oranye warna-warni jatuh terus-menerus di seluruh kanvas (frekuensi 550 ms, depth 4.8).
- **Variasi ukuran NPC**: warga desa kini punya skala berbeda — anak kecil (0.82×), warga tua (1.08×), dan ukuran normal — membuat desa terasa lebih hidup.
- **Bingkai ganda layar**: `#game` mendapat `box-shadow` bertiga — garis luar gelap tipis, bayangan dalam, dan garis dalam emas transparan — tampilan lebih premium.

## [0.29.0], Village well, enhanced confetti, win border glow

### Ditambahkan
- **Sumur Desa** di (10,11): bangunan dekoratif prosedural (tiang kayu, bibir batu, lubang gelap + kilatan air, ember) yang bisa diajak bicara untuk pesan gotong royong. Label abu-abu membedakannya dari lokasi misi.
- **Konfeti diperkuat**: 6 warna × 24 partikel + ledakan emas besar 40 partikel 520 ms setelah burst awal.
- **Glow tepi layar**: `#game` mendapat animasi `winGlow` (lingkaran cahaya emas ke luar) saat `celebrate()` dipanggil.
- Flash kemenangan berubah warna dari putih ke kuning emas.

## [0.28.0], Torch lights, HUD pulse, quest stage toasts

### Ditambahkan
- 5 obor berkedip di dekat Balai Desa, Pasar, dan Kantor Koperasi: lingkaran cahaya emas + bintik nyala oranye/kuning beranimasi di `update()`.
- Chip HUD uang menyala sebentar (glowing box-shadow) setiap kali saldo berubah (`chipPulse` animation).
- Toast pemberitahuan muncul di atas layar saat tahap misi berganti (JOIN → LOAN → PLANT → dst.), slide-in + fade-out dalam 2,6 detik.

## [0.27.0], 4-directional player, title particles, world bushes

### Ditambahkan
- Karakter pemain kini punya sprite belakang (`char_u`/`char_wu`): saat bergerak ke atas, punggung karakter terlihat (rambut penuh, wajah tak tampak).
- Layar judul: 28 partikel emas naik perlahan di latar belakang (`@keyframes tSpark`), memberikan kesan sinematik.
- Semak dekoratif (`drawBushes`) tersebar di ~7% petak rumput di luar radius bangunan — memperkaya detail dunia.

## [0.26.0], Dialogue polish & water decorations

### Ditambahkan
- Kotak dialog tampil dengan header strip emas (gradasi gold-dark → gold → gold-dark) sebagai nameplate pembicara — memisahkan nama dari teks.
- Animasi slide-up (`dlgSlideIn`) saat dialog terbuka; kotak muncul smooth dari bawah.
- Teratai prosedural di ubin air (20% petak air) dengan daun hijau berlapis dan bunga putih-pink kecil (35% teratai punya bunga).
- Efek hover tombol dialog lebih ekspresif: angkat 2px + bayangan lebih dalam + warna lebih cerah.

## [0.25.0], NPC sprites & world polish

### Ditambahkan
- Warga desa kini tampil sebagai karakter pixel-art penuh (20×30 px: topi berwarna, kepala, badan, kaki), bukan lingkaran polos; 6 varian kostum berbeda menggunakan `generateTexture`.
- Warga menghadap kiri/kanan sesuai arah gerak (flip sprite horizontal).
- Bayangan oval di bawah tiap warga; animasi bob idle berbeda tiap warga.
- Lantai jalan berbatu: garis sendi paving menambah tekstur depth tanpa biaya render ekstra.
- 3 bayangan awan dengan kecepatan & ukuran berbeda menggantikan awan tunggal (atmosfer lebih hidup).

## [0.24.0], Recap access & glossary expansion

### Ditambahkan
- Tombol "Lihat Rapor & Sertifikat" di dialog Kantor Koperasi saat misi selesai (DONE) — pemain bisa membuka rapor kapan saja tanpa memuat ulang.
- Istilah "Rentenir" ditambahkan ke Glosarium (tombol H) dengan definisi singkat.

## [0.23.0], Loan-type badge on certificate

### Ditambahkan
- Rapor dan Sertifikat PNG kini menampilkan lencana warna-warni pilihan pinjaman: hijau "Koperasi (pilihan bijak!)" atau merah "Rentenir (rugi Rp22.500 bunga)".

## [0.22.0], Demo step counter

### Ditambahkan
- Keterangan demo kini menampilkan nomor langkah `[1/8]` di depan teks tiap tahap.

## [0.21.0], About screen & demo caption update

### Diperbarui
- Layar Tentang: tambah bullet warga NPC, pilihan modal koperasi vs rentenir; gabung glosarium ke bullet demo.
- Caption akhir demo menginformasikan interaksi warga dan tombol H glosarium.

## [0.20.0], Villager NPC dialogues

### Ditambahkan
- Menekan Spasi dekat warga memunculkan dialog 'Warga Desa' dengan fakta koperasi acak (7 topik: sejarah, skala, prinsip ICA, Kospin, RAT, SHU, gotong royong).

## [0.19.0], Wandering villager NPCs

### Ditambahkan
- 7 warga desa bergerak prosedural (lingkaran tunik berwarna + kepala skin) di kedalaman 2.1/2.15.
- Tiap warga berpindah petak secara acak setiap 1.6–3.8 detik, tidak memasuki air.

## [0.18.0], CHANGELOG catch-up

### Diperbarui
- Changelog mencakup semua perubahan dari wave 14 sampai 17.

## [0.17.0], Grade in HUD & koperasi DONE dialogue

### Ditambahkan
- Panel misi menampilkan nilai literasi (A/B/C/D) di judul saat misi selesai.
- Kunjungan ke Kantor Koperasi setelah misi selesai menampilkan ringkasan simpanan dan SHU, dengan opsi setor Simpanan Wajib lanjutan.

## [0.16.0], Footprint trail & controls hint

### Ditambahkan
- Jejak kaki (ellipse gelap, α=0.22) muncul di posisi lama pemain setiap langkah dan memudar dalam 440 ms.
- Hint kontrol memperlihatkan `Enter` sebagai alternatif `Spasi`, dan `H` untuk membuka Glosarium.

## [0.15.0], UX polish

### Ditambahkan
- Lambang koperasi di layar judul berdenyut dengan cahaya emas halus (emblemGlow, 3.8 detik).
- Tombol `Enter` kini memajukan dialog seperti `Spasi`.
- Efek getar kecil saat uang dikeluarkan (membeli/membayar).

### Diperbaiki
- Format uang negatif: dari `Rp-50.000` menjadi `-Rp50.000`.

## [0.14.0], Water ripples & entrance animations

### Ditambahkan
- 6 lingkaran riak memudar di batas air atas dan bawah (siklus 4.2 dtk, `strokeCircle`).
- Animasi CSS `overlayIn` (fade) pada layar judul dan layar rapor.
- Animasi CSS `cardIn` (fade + geser ke atas 18 px) pada kartu judul dan kartu rapor.

## [0.13.0], Rentenir warning & post-game NPC

### Ditambahkan
- Konfirmasi sebelum memilih rentenir: dialog peringatan membandingkan biaya rentenir (Rp97.500) vs koperasi (Rp75.000) secara eksplisit.
- Opsi "Batal, pilih koperasi" di layar konfirmasi agar pemain dapat beralih ke pilihan bijak.
- Dialog Kepala Desa setelah misi selesai (DONE): pesan penutup menyebut nama pemain dan merangkum pencapaian.
- Dialog Bendahara setelah misi selesai (DONE): apresiasi anggota yang bertanggung jawab.

## [0.12.0], Code cleanup

### Diperbaiki
- `floatText()` kini memakai font Jersey 10 (selaras tipografi HUD) pada ukuran 22px.
- Field `emoji` yang tidak terpakai dihapus dari semua entri SPOTS di `data.js`.
- Panel misi tidak lagi tumpang-tindih chip HUD di layar sangat sempit (< 420 px).

## [0.11.0], Music & performance

### Ditambahkan
- Suara harmoni kedua (triangle oscillator) melengkapi melodi utama.
- Chime tiga nada saat berpindah tahap misi (advance SFX).
- Bit-aritmetika `lerpC` menggantikan Color API Phaser untuk animasi air — nol alokasi GC per frame.
- Layar Tentang menampilkan ringkasan fitur lengkap dalam bullet list.

## [0.10.0], Social sharing

### Ditambahkan
- Tombol "Bagikan" di layar rapor menggunakan Web Share API dengan fallback clipboard.
- Teks bagikan mencantumkan nilai, gelar, skor kuis, dan URL permainan.

## [0.9.0], Demo automation depth

### Ditambahkan
- Mode demo kini mencakup empat kuis: Simpanan Pokok, Modal, Simpanan Wajib, dan SHU.
- Langkah setoran Simpanan Wajib ditambahkan ke alur demo (8 langkah total).
- Guard loop demo ditingkatkan ke 22 untuk mendukung rantai pilihan yang lebih panjang.

## [0.8.0], Full 5-quiz curriculum

### Ditambahkan
- Kuis `wajib`: Simpanan Wajib bukan denda, melainkan tabungan rutin anggota.
- Kuis `rat`: RAT menerapkan satu anggota satu suara, bukan proporsional modal.
- Kuis `wajib` dipicu otomatis setelah setoran Simpanan Wajib pertama.
- Kuis `rat` tersedia interaktif di Balai Desa sebelum tahap RAT.
- Sertifikat kini melacak semua 5 konsep dengan tanda baca yang tepat.
- Demo otomatis mencakup setoran Simpanan Wajib dan kuis keempatnya.

## [0.7.0], Certificate & ambient life

### Ditambahkan
- Sertifikat PNG: latar gradasi hangat, watermark lambang koperasi, hiasan sudut berlian emas.
- Tanda kuis pada rapor menggunakan HTML entity (&#10003;/&#9888;/&#183;) bukan emoji.
- 5 burung kecil melintas di langit setiap ~19 detik (depth 5.8, efek yoyo).
- Status anggota HUD disederhanakan menjadi "Anggota" tanpa karakter tanda centang.

## [0.6.0], Smoke & quest progress

### Ditambahkan
- 5 partikel asap beranimasi dari cerobong Kepala Desa (siklus berbasis waktu, depth 3.2).
- Bilah kemajuan misi (emas, transisi CSS) + penunjuk langkah "X / 7" di panel misi.
- `questInfo()` kini mengembalikan `step` dan `total` untuk setiap tahap misi.

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
