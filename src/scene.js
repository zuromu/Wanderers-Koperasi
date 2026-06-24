/**
 * scene.js, Scene Phaser dunia desa.
 * Semua grafik digambar prosedural: tanah, air, bangunan pixel-art bergaris tinta,
 * karakter beranimasi, pollen melayang, dan bayangan awan bergerak.
 */

import { TILE, COLS, ROWS, MAP, SPOTS } from './data.js';
import { S, questInfo } from './state.js';
import { interact } from './quest.js';
import { isDialogueOpen, advanceDialogue, refresh, setSceneRef, showDialogue } from './ui.js';
import { C } from './palette.js';
import { ensureSpark, floatText, burst, confetti, shake, flash } from './effects.js';
import * as Audio from './audio.js';

function rng(seed){
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a>>>15), 1|a);
    t = (t + Math.imul(t ^ (t>>>7), 61|t)) ^ t; return ((t ^ (t>>>14))>>>0) / 4294967296; };
}
const lerpC = (c1, c2, t) => {
  const r = ((c1>>16)&0xFF) + (((c2>>16)&0xFF) - ((c1>>16)&0xFF)) * t;
  const g = ((c1>>8) &0xFF) + (((c2>>8) &0xFF) - ((c1>>8) &0xFF)) * t;
  const b = (c1      &0xFF) + ((c2      &0xFF) - (c1      &0xFF)) * t;
  return (r|0)<<16 | (g|0)<<8 | (b|0);
};

const NPC_TIPS = [
  'Koperasi pertama di Indonesia didirikan oleh Raden Aria Wiriatmadja pada 1896 di Purwokerto, untuk membantu pegawai dari jeratan rentenir.',
  'Ada lebih dari 140.000 koperasi aktif di Indonesia! Bersama kita lebih kuat.',
  'Tujuh prinsip koperasi internasional: keanggotaan sukarela, pengelolaan demokratis, otonomi, pendidikan, kerja sama antarkoperasi, dan kepedulian komunitas.',
  'Koperasi Simpan Pinjam (Kospin) menyediakan akses modal yang adil tanpa bunga mencekik seperti rentenir.',
  'Di RAT, setiap anggota punya SATU suara, tidak peduli besar kecil simpanannya. Inilah demokrasi ekonomi!',
  'SHU bukan bunga bank — ini bagi hasil keuntungan koperasi. Makin aktif kamu bertransaksi, makin besar SHU-mu.',
  'Gotong royong adalah jiwa koperasi: dari anggota, oleh anggota, dan untuk kesejahteraan anggota bersama.',
  'Koperasi berbeda dari perusahaan biasa: tujuannya bukan memaksimalkan keuntungan pemilik, tapi mensejahterakan anggota.',
];

const NPC_CHAR_TIPS = {
  'Pak Darmo': [
    'Sudah 30 tahun saya jadi anggota koperasi. Sawah ini pun dulu dibeli pakai modal pinjaman koperasi desa.',
    'Koperasi Unit Desa (KUD) dulu jadi tulang punggung pertanian — pupuk, bibit, kredit tani semua dari sana.',
    'Anak-anak muda perlu belajar sejarah koperasi. Raden Aria Wiriatmadja mendirikannya tahun 1896 buat bantu pegawai yang terjerat rentenir.',
  ],
  'Bu Siti': [
    'Kalau mau buka warung, jangan pinjam ke rentenir! Bunga 30% per bulan itu mencekik. Koperasi jauh lebih manusiawi.',
    'Di pasar ini separuh pedagangnya anggota koperasi. Kami saling bantu, tidak bersaing mati-matian.',
    'SHU itu seperti bonus akhir tahun. Makin sering bertransaksi lewat koperasi, makin besar bagianmu!',
  ],
  'Dodi': [
    'Kak, koperasi itu apa? Kata Bu Lastri, kaya menabung bareng teman-teman, terus untungnya dibagi!',
    'Di sekolahku ada koperasi siswa lho! Aku beli buku dan pensil di sana. Lebih murah dari warung luar!',
    'Ayahku bilang, kalau mau jadi pengusaha sukses, harus tahu dulu cara berkooperasi. Seru ya?',
  ],
  'Ratna': [
    'Saya baru ikut RAT pertama kali. Satu anggota satu suara — tidak peduli besar kecil simpanannya!',
    'Simpanan di koperasi bukan hilang ya. Itu aset milik sendiri yang bisa diambil saat keluar dari keanggotaan.',
    'Ada 7 prinsip koperasi internasional: keanggotaan sukarela, pengelolaan demokratis, sampai kepedulian terhadap komunitas.',
  ],
  'Pak Hasan': [
    'Perahu saya ini dibeli pakai pinjaman koperasi nelayan. Cicilan ringan, tidak ada bunga berbunga.',
    'Koperasi nelayan di sini bantu kami beli jaring dan es bersama-sama. Beli kolektif jauh lebih hemat!',
    'Di koperasi, kalau kamu aktif, kamu dapat SHU lebih besar. Berbeda dengan bank yang keuntungannya buat pemegang saham.',
  ],
  'Bu Lastri': [
    'Saya mengajarkan literasi keuangan di sekolah. Koperasi adalah contoh nyata ekonomi gotong royong Pancasila!',
    'Menurut UU No.25/1992, koperasi adalah badan usaha yang beranggotakan orang-seorang, dikelola secara demokratis.',
    'Koperasi siswa mengajarkan anak-anak: menabung, meminjam dengan bertanggung jawab, dan berbagi hasil secara adil.',
  ],
  'Rudi': [
    'Bro, tahu nggak? Ada lebih dari 140.000 koperasi aktif di Indonesia! Gila banyaknya, tapi masih banyak yang belum kenal.',
    'Lambang koperasi itu ada pohon beringin, timbangan, bintang, roda gigi, padi-kapas... masing-masing ada maknanya lho!',
    'Aku mau gabung koperasi pemuda desa. Lumayan buat modal usaha kecil-kecilan, bunganya jauh lebih manusiawi.',
  ],
};

export class Village extends Phaser.Scene {
  constructor(){ super('Village'); }

  create(){
    setSceneRef(this);
    ensureSpark(this);
    this.waterTiles  = [];
    this.pollen      = [];
    this.smoke       = [];
    this.birds       = [];
    this.ripples     = [];
    this.npcs        = [];
    this.clouds      = [];
    this.torches     = [];
    this.fireflies   = [];
    this.windowGlows = [];
    this.butterflies = [];
    this.locked      = true;

    this.drawGround();
    this.drawRoadCrossings();
    this.drawGrassTufts();
    this.drawCliffEdges();
    this.drawWater();
    this.drawWaterShimmer();
    this.drawWaterFoam();
    this.drawShoreline();
    this.drawWaterLilies();
    this.drawBushes();
    this.drawTrees();
    this.makeClouds();
    this.drawBuildings();
    this.makeWindowGlows();
    this.drawPropsDecor();
    this.makeTorches();
    this.makeMarker();
    this.makePlayer();
    this.makePollen();
    this.makeSmoke();
    this.makeBirds();
    this.makeRipples();
    this.makeNpcs();
    this.makeFireflies();
    this.makeLeaves();
    this.makeButterflies();
    this.makeAtmosphere();
    this.makeVignette();
    this.bindInput();
    this.hintShowing = false;
    this.makeInteractHint();

    this.cameras.main.fadeIn(450, 8, 6, 12);
    this.scheduleChirp();
    refresh();
  }

  /* -------- Tanah (rumput + jalan) -------- */
  drawGround(){
    const g = this.add.graphics().setDepth(0);
    const r = rng(1337);
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        const t = +MAP[y][x];
        if (t === 2) continue;
        const base  = t === 1 ? C.path      : C.grass;
        const shade = t === 1 ? C.pathShade : C.grassShade;
        g.fillStyle(lerpC(base, shade, 0.05 + (x/COLS)*0.18 + (y/ROWS)*0.12 + r()*0.08), 1).fillRect(x*TILE, y*TILE, TILE, TILE);
        const dots = 1 + ((r()*3)|0);
        for (let d=0; d<dots; d++){
          const dx = x*TILE + 4 + r()*(TILE-8);
          const dy = y*TILE + 4 + r()*(TILE-8);
          if (t === 1){ g.fillStyle(C.pathShade, .5).fillCircle(dx, dy, 1.2); }
          else {
            const flower = r() > 0.72;
            const fc = [0xffe08a, 0xff9fb3, 0xffffff][(r()*3)|0];
            g.fillStyle(flower ? fc : C.grassHi, flower ? .9 : .55);
            g.fillCircle(dx, dy, flower ? 1.9 : 1.3);
          }
        }
      }
    }
    // Batu paving individual per petak jalan (2×2 per tile)
    const rs = rng(9182);
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        if (+MAP[y][x] !== 1) continue;
        const px = x*TILE, py = y*TILE;
        [[2,2],[21,2],[2,21],[21,21]].forEach(([ox,oy]) => {
          const jx = (rs()-0.5)*3, jy = (rs()-0.5)*3;
          const lt  = 0.08 + rs()*0.22;
          g.fillStyle(lerpC(C.path, C.pathShade, lt)).fillRoundedRect(px+ox+jx, py+oy+jy, 16, 16, 3);
          g.lineStyle(1, C.pathEdge, 0.32).strokeRoundedRect(px+ox+jx, py+oy+jy, 16, 16, 3);
          g.fillStyle(0xf8e8b4, 0.13).fillRect(px+ox+jx+1, py+oy+jy+1, 7, 2);
        });
        // Retak halus sesekali (tampilan berumur & berkarakter)
        if (rs() < 0.12){
          const cx2 = px+6+rs()*28, cy2 = py+6+rs()*28;
          g.lineStyle(0.7, C.pathEdge, 0.28);
          g.lineBetween(cx2, cy2, cx2+(rs()-0.5)*10, cy2+(rs()-0.5)*10);
        }
        // Genangan kecil (5% tile, tampak habis hujan)
        if (rs() < 0.05){
          const px2 = px+8+rs()*18, py2 = py+10+rs()*18;
          const pw = 10+rs()*7, ph = 4+rs()*3;
          g.fillStyle(0x88c4d8, 0.19).fillEllipse(px2, py2, pw, ph);
          g.fillStyle(0xd0eff8, 0.10).fillEllipse(px2-1, py2-0.5, pw*0.5, ph*0.4);
        }
      }
    }
    // Transisi halus antara petak rumput dan jalan (3px feather di tepi)
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        const t = +MAP[y][x];
        if (t === 2) continue;
        if (x+1 < COLS && +MAP[y][x+1] !== 2 && +MAP[y][x+1] !== t){
          const mid = lerpC(t===1?C.path:C.grass, +MAP[y][x+1]===1?C.path:C.grass, 0.5);
          g.fillStyle(mid, 0.35).fillRect((x+1)*TILE-3, y*TILE+1, 6, TILE-2);
        }
        if (y+1 < ROWS && +MAP[y+1][x] !== 2 && +MAP[y+1][x] !== t){
          const mid = lerpC(t===1?C.path:C.grass, +MAP[y+1][x]===1?C.path:C.grass, 0.5);
          g.fillStyle(mid, 0.35).fillRect(x*TILE+1, (y+1)*TILE-3, TILE-2, 6);
        }
      }
    }
  }

  /* -------- Tebing batu di batas utara + alang-alang di batas selatan -------- */
  drawCliffEdges(){
    const rc = rng(3141);
    // Tebing utara: lapisan batu di tepi atas baris 1 yang berbatasan langsung dengan air
    const gN = this.add.graphics().setDepth(1.65);
    for (let x=0; x<COLS; x++){
      if (+MAP[1][x] === 2) continue;
      const px = x*TILE, py = TILE;
      gN.fillStyle(C.ink, 0.38).fillRect(px, py-5, TILE, 5);
      const c1 = lerpC(C.stoneDark, C.ink, 0.32 + rc()*0.14);
      const c2 = lerpC(C.stone, C.stoneDark, 0.42);
      gN.fillStyle(c1, 0.58).fillRect(px, py-3, TILE, 2.5);
      gN.fillStyle(c2, 0.34).fillRect(px+1, py-1, TILE-2, 2);
      gN.lineStyle(0.5, C.ink, 0.18).lineBetween(px, py-2, px+TILE, py-2);
      if (rc() < 0.26){
        const bx = px + 5 + rc()*(TILE-14);
        gN.fillStyle(c1, 0.52).fillRoundedRect(bx, py-6, 5+rc()*5, 4, 0.5);
        gN.lineStyle(0.5, C.ink, 0.14).strokeRoundedRect(bx, py-6, 5+rc()*5, 4, 0.5);
      }
      if (rc() < 0.30) gN.fillStyle(0x4a7a28, 0.32).fillRect(px+3+rc()*(TILE-8), py-3, 3+rc()*5, 1.5);
    }
    // Alang-alang selatan: tumbuh di batas bawah baris 12 ke dalam area air
    const gS = this.add.graphics().setDepth(1.65);
    for (let x=1; x<COLS-1; x++){
      if (+MAP[12][x] === 2) continue;
      const px = x*TILE, py = 13*TILE;
      const count = 2 + (rc()*4)|0;
      for (let i=0; i<count; i++){
        const rx = px + 4 + rc()*(TILE-8);
        const rh = 8 + rc()*14;
        const lean = (rc()-0.5)*6;
        const col = rc() < 0.55 ? 0x8a6a30 : 0xa08040;
        gS.lineStyle(1.2 + rc()*0.5, col, 0.52 + rc()*0.22).lineBetween(rx, py, rx+lean, py-rh);
        if (rc() < 0.55){
          gS.lineStyle(0.8, 0x6a8828, 0.32).lineBetween(rx+lean*0.4, py-rh*0.5, rx+lean*0.4+(rc()-0.5)*8, py-rh*0.7);
        }
        if (rh > 17) gS.fillStyle(0x7a5020, 0.68).fillEllipse(rx+lean, py-rh, 2.5+rc()*1.5, 5+rc()*3);
      }
    }
    // Tebing barat & timur: garis batu tipis di batas sisi (baris yang berbatasan dengan air di col 0/19)
    [0, COLS-1].forEach(bx => {
      const wx = bx === 0 ? TILE : (COLS-1)*TILE;
      for (let y=1; y<ROWS-1; y++){
        if (+MAP[y][bx === 0 ? 1 : COLS-2] === 2) continue;
        const py = y*TILE;
        const cx2 = bx === 0 ? wx : wx+TILE;
        const dir = bx === 0 ? 1 : -1;
        gN.fillStyle(C.ink, 0.30).fillRect(bx===0?wx-4:wx, py, 4, TILE);
        gN.fillStyle(lerpC(C.stoneDark, C.ink, 0.35), 0.48).fillRect(bx===0?wx-3:wx, py+1, 2.5, TILE-2);
        if (rc() < 0.22){
          gN.fillStyle(0x4a7a28, 0.28).fillRect(bx===0?wx-3:wx, py+4+rc()*(TILE-10), 2, 3+rc()*5);
        }
      }
    });
  }

  /* -------- Air beranimasi -------- */
  drawWater(){
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        if (+MAP[y][x] !== 2) continue;
        const rect = this.add.rectangle(x*TILE+TILE/2, y*TILE+TILE/2, TILE, TILE, C.water).setDepth(1);
        rect._phase = x*0.7 + y*1.3;
        this.waterTiles.push(rect);
      }
    }
  }

  /* -------- Kilatan cahaya statis di permukaan air -------- */
  drawWaterShimmer(){
    const g = this.add.graphics().setDepth(1.05);
    this.waterShimmer = g; // disimpan untuk animasi alfa
    const r = rng(5577);
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        if (+MAP[y][x] !== 2) continue;
        const px = x*TILE, py = y*TILE;
        const count = 2 + (r()*3)|0;
        for (let s=0; s<count; s++){
          const sx = px + 4 + r()*(TILE-8);
          const sy = py + 4 + r()*(TILE-8);
          const ln = 5 + r()*14;
          g.lineStyle(1, C.waterHi, 0.10 + r()*0.12);
          g.lineBetween(sx, sy, sx+ln*0.75, sy-ln*0.25);
        }
      }
    }
  }

  /* -------- Busa tepian air -------- */
  drawWaterFoam(){
    const g = this.add.graphics().setDepth(1.1);
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        if (+MAP[y][x] !== 2) continue;
        if (y>0 && +MAP[y-1][x]!==2)
          g.fillStyle(C.foam, 0.32).fillRect(x*TILE+3, y*TILE, TILE-6, 3);
        if (y<ROWS-1 && +MAP[y+1][x]!==2)
          g.fillStyle(C.foam, 0.32).fillRect(x*TILE+3, y*TILE+TILE-3, TILE-6, 3);
        if (x>0 && +MAP[y][x-1]!==2)
          g.fillStyle(C.foam, 0.32).fillRect(x*TILE, y*TILE+3, 3, TILE-6);
        if (x<COLS-1 && +MAP[y][x+1]!==2)
          g.fillStyle(C.foam, 0.32).fillRect(x*TILE+TILE-3, y*TILE+3, 3, TILE-6);
      }
    }
  }

  _drawWell(g, cx, cy){
    // Tiang penyangga kayu kiri & kanan (dengan highlight)
    g.fillStyle(C.woodDark).fillRect(cx-11, cy-14, 3, 18);
    g.fillStyle(C.wood, 0.4).fillRect(cx-11, cy-14, 1, 18);
    g.lineStyle(1.5, C.ink, 1).strokeRect(cx-11, cy-14, 3, 18);
    g.fillStyle(C.woodDark).fillRect(cx+8, cy-14, 3, 18);
    g.fillStyle(C.wood, 0.4).fillRect(cx+8, cy-14, 1, 18);
    g.lineStyle(1.5, C.ink, 1).strokeRect(cx+8, cy-14, 3, 18);
    // Palang kayu atas (dengan serat)
    g.fillStyle(C.wood).fillRect(cx-13, cy-14, 26, 5);
    g.fillStyle(0xd4a870, 0.3).fillRect(cx-12, cy-13, 24, 1.5);
    g.fillStyle(C.woodDark, 0.25).fillRect(cx-12, cy-10, 24, 1);
    g.lineStyle(1.5, C.ink, 1).strokeRect(cx-13, cy-14, 26, 5);
    // Bibir sumur: batu bersusun (kiri, tengah, kanan)
    g.fillStyle(lerpC(C.stone, C.stoneDark, 0.15)).fillRoundedRect(cx-10, cy+2, 9, 12, 2);
    g.fillStyle(0xb8b7c4, 0.38).fillRect(cx-9, cy+3, 7, 3);
    g.lineStyle(1, C.ink, 0.85).strokeRoundedRect(cx-10, cy+2, 9, 12, 2);
    g.fillStyle(C.stone).fillRoundedRect(cx-1, cy+1, 2, 13, 1);
    g.lineStyle(0.8, C.ink, 0.55).strokeRoundedRect(cx-1, cy+1, 2, 13, 1);
    g.fillStyle(lerpC(C.stone, C.stoneDark, 0.1)).fillRoundedRect(cx+1, cy+2, 9, 12, 2);
    g.fillStyle(0xb8b7c4, 0.38).fillRect(cx+2, cy+3, 7, 3);
    g.lineStyle(1, C.ink, 0.85).strokeRoundedRect(cx+1, cy+2, 9, 12, 2);
    // Lumut di sisi kiri
    g.fillStyle(0x5a8a30, 0.32).fillRect(cx-9, cy+9, 3, 4);
    g.fillStyle(0x5a8a30, 0.22).fillRect(cx+5, cy+10, 2, 3);
    // Lubang gelap + pantulan air
    g.fillStyle(C.shadow, 0.80).fillEllipse(cx, cy+9, 14, 8);
    g.fillStyle(C.water, 0.22).fillEllipse(cx-1, cy+10, 7, 3.5);
    g.fillStyle(C.waterHi, 0.15).fillEllipse(cx-2, cy+10, 3, 1.5);
    // Tali zigzag (lebih dinamis dari garis lurus)
    g.lineStyle(1, C.ink, 0.65);
    g.lineBetween(cx, cy-9,  cx+1, cy-7);
    g.lineBetween(cx+1, cy-7, cx-1, cy-5);
    g.lineBetween(cx-1, cy-5, cx+1, cy-3);
    g.lineBetween(cx+1, cy-3, cx, cy+2);
    // Ember kayu (lebih detail)
    g.fillStyle(C.woodDark).fillRoundedRect(cx-3.5, cy-3, 7, 5.5, 1);
    g.fillStyle(C.wood, 0.38).fillRect(cx-3, cy-2.5, 5, 1.5);
    g.lineStyle(0.8, C.stoneDark, 0.65).lineBetween(cx-3.5, cy-0.5, cx+3.5, cy-0.5);
    g.lineStyle(1, C.ink, 0.9).strokeRoundedRect(cx-3.5, cy-3, 7, 5.5, 1);
    // Gagang ember (U-shape)
    g.lineStyle(1, C.ink, 0.5).lineBetween(cx-2.5, cy-3, cx-1.5, cy-5);
    g.lineBetween(cx-1.5, cy-5, cx+1.5, cy-5);
    g.lineBetween(cx+1.5, cy-5, cx+2.5, cy-3);
  }

  /* -------- Semak / tanaman dekoratif di rumput -------- */
  drawBushes(){
    const g = this.add.graphics().setDepth(1.8);
    const r = rng(123);
    for (let y=1; y<ROWS-1; y++){
      for (let x=1; x<COLS-1; x++){
        if (+MAP[y][x] !== 0) continue;
        if (SPOTS.some(s => Math.abs(s.x-x)<=2 && Math.abs(s.y-y)<=2)) continue;
        if (r() > 0.07) continue;
        const cx = x*TILE + TILE/2 + (r()-0.5)*8;
        const cy = y*TILE + TILE/2 + (r()-0.5)*6;
        const s  = 0.7 + r()*0.35;
        g.fillStyle(C.leafDark, 0.72).fillCircle(cx, cy, 5.5*s);
        g.fillStyle(C.leaf,     0.60).fillCircle(cx-2*s, cy-2*s, 3.5*s);
        g.fillStyle(C.leafHi,   0.42).fillCircle(cx-3*s, cy-3.5*s, 2*s);
        g.lineStyle(1, C.ink, 0.18).strokeCircle(cx, cy, 5.5*s);
        // Buah beri kecil (kadang-kadang)
        if (r() < 0.35){
          const bc = [C.coral, C.roofRed, 0xff9944][(r()*3)|0];
          for (let b=0; b<3; b++)
            g.fillStyle(bc, 0.88).fillCircle(cx+(r()-0.5)*5, cy+(r()-0.5)*4, 1.7);
        }
      }
    }
  }

  /* -------- Hiasan batu di persimpangan jalan utama -------- */
  drawRoadCrossings(){
    const g = this.add.graphics().setDepth(0.2);
    // Persimpangan utama: baris 5 × col 9, baris 10 × col 9
    const CX = [
      [9*TILE + TILE/2, 5*TILE  + TILE/2],
      [9*TILE + TILE/2, 10*TILE + TILE/2],
    ];
    for (const [cx, cy] of CX){
      // Lingkaran terluar (batu lebih terang, inlay)
      g.lineStyle(2.5, C.pathShade, 0.20).strokeCircle(cx, cy, 18);
      g.lineStyle(1.5, C.pathShade, 0.13).strokeCircle(cx, cy, 26);
      // Garis silang (mawar kompas)
      g.lineStyle(2, C.pathShade, 0.16).lineBetween(cx-22, cy, cx+22, cy);
      g.lineStyle(2, C.pathShade, 0.16).lineBetween(cx, cy-22, cx, cy+22);
      // Diagonal lebih tipis
      g.lineStyle(1, C.pathShade, 0.09).lineBetween(cx-17, cy-17, cx+17, cy+17);
      g.lineStyle(1, C.pathShade, 0.09).lineBetween(cx-17, cy+17, cx+17, cy-17);
      // Lingkaran tengah (ujung mawar kompas)
      g.fillStyle(C.pathShade, 0.16).fillCircle(cx, cy, 4.5);
      g.fillStyle(C.gold, 0.10).fillCircle(cx, cy, 3);
    }
    // Tanda persimpangan kecil di junction baris 5/2 dan col 9/3
    const MINOR = [
      [3*TILE+TILE/2, 5*TILE+TILE/2], [16*TILE+TILE/2, 5*TILE+TILE/2],
      [3*TILE+TILE/2, 10*TILE+TILE/2],[16*TILE+TILE/2, 10*TILE+TILE/2],
    ];
    for (const [cx, cy] of MINOR){
      g.lineStyle(1.5, C.pathShade, 0.14).strokeCircle(cx, cy, 10);
      g.lineStyle(1, C.pathShade, 0.10).lineBetween(cx-12, cy, cx+12, cy);
      g.lineStyle(1, C.pathShade, 0.10).lineBetween(cx, cy-12, cx, cy+12);
      g.fillStyle(C.pathShade, 0.12).fillCircle(cx, cy, 3);
    }
  }

  /* -------- Rerumputan panjang di tepi air -------- */
  drawGrassTufts(){
    const g = this.add.graphics().setDepth(1.6);
    const r = rng(7654);
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        if (+MAP[y][x] !== 0) continue;
        const adj = (y>0&&+MAP[y-1][x]===2)||(y<ROWS-1&&+MAP[y+1][x]===2)||
                    (x>0&&+MAP[y][x-1]===2)||(x<COLS-1&&+MAP[y][x+1]===2);
        if (!adj) continue;
        const px = x*TILE, py = y*TILE;
        const count = 3 + (r()*4)|0;
        for (let t=0; t<count; t++){
          const bx  = px + 4 + r()*(TILE-8);
          const by  = py + 4 + r()*(TILE-8);
          const h   = 5  + r()*9;
          const ln  = (r()-0.5)*6;
          const gc  = [C.leaf, C.leafHi, C.leafDark][(r()*3)|0];
          g.lineStyle(1.2, gc, 0.55 + r()*0.3);
          g.lineBetween(bx, by, bx+ln, by-h);
          g.lineBetween(bx, by, bx+ln*0.5+1, by-h*0.6);
        }
      }
    }
  }

  /* -------- Batu-batu kecil di tepi air (garis pantai natural) -------- */
  drawShoreline(){
    const g = this.add.graphics().setDepth(1.15);
    const rs = rng(8123);
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        if (+MAP[y][x] !== 2) continue;
        const adjLand = (y>0&&+MAP[y-1][x]!==2)||(y<ROWS-1&&+MAP[y+1][x]!==2)||
                        (x>0&&+MAP[y][x-1]!==2)||(x<COLS-1&&+MAP[y][x+1]!==2);
        if (!adjLand) continue;
        const px = x*TILE, py = y*TILE;
        const count = 2 + (rs()*3)|0;
        for (let i=0; i<count; i++){
          const rx = px + 5 + rs()*(TILE-10);
          const ry = py + 5 + rs()*(TILE-10);
          const rw = 4 + rs()*6, rh = 2.5 + rs()*3.5;
          const shade = 0.18 + rs()*0.18;
          g.fillStyle(lerpC(C.stone, C.stoneDark, 0.3 + rs()*0.4), 0.42 + rs()*0.28).fillEllipse(rx, ry, rw, rh);
          g.fillStyle(0xb8c8d0, shade).fillEllipse(rx-rw*0.18, ry-rh*0.2, rw*0.45, rh*0.35);
        }
      }
    }
  }

  /* -------- Teratai di permukaan air (lebih detail) -------- */
  drawWaterLilies(){
    const g = this.add.graphics().setDepth(1.2);
    const r = rng(77);
    for (let y=1; y<ROWS-1; y++){
      for (let x=1; x<COLS-1; x++){
        if (+MAP[y][x] !== 2) continue;
        if (r() > 0.20) continue;
        const cx = x*TILE + 6 + r()*(TILE-12);
        const cy = y*TILE + 6 + r()*(TILE-12);
        const s  = 0.7 + r()*0.5;
        // Bayangan di bawah bantalan
        g.fillStyle(C.shadow, 0.16).fillEllipse(cx+1, cy+2, 14*s, 9*s);
        // Bantalan daun utama
        g.fillStyle(C.leafDark, 0.74).fillEllipse(cx, cy, 14*s, 9*s);
        // Highlight hijau muda
        g.fillStyle(C.leaf, 0.38).fillEllipse(cx-1.5*s, cy-s, 9*s, 5.5*s);
        // Serat / vena daun
        g.lineStyle(0.7, C.leafHi, 0.22).lineBetween(cx+s*5, cy, cx-s*5, cy);
        g.lineStyle(0.6, C.leafHi, 0.17).lineBetween(cx+s*4, cy-s*2, cx-s*3, cy-s);
        g.lineStyle(0.6, C.leafHi, 0.17).lineBetween(cx+s*4, cy+s*2, cx-s*3, cy+s);
        // Bunga teratai (35%)
        if (r() < 0.35){
          g.fillStyle(0xffe8f0, 0.90).fillCircle(cx, cy, s*2.8);   // mahkota luar
          g.fillStyle(0xffd8b0, 0.95).fillCircle(cx, cy, s*1.9);   // mahkota dalam
          g.fillStyle(0xffee55, 1.00).fillCircle(cx, cy, s*1.1);   // kepala sari kuning
          g.fillStyle(0xffffff, 0.50).fillCircle(cx-0.5*s, cy-0.5*s, 0.5*s); // specular
        }
      }
    }
  }

  /* -------- Pohon dekoratif di tepi peta -------- */
  drawTrees(){
    const r = rng(42);
    const g = this.add.graphics().setDepth(2.5);
    const TREE_POS = [
      [2,1],[5,1],[12,1],[17,1],
      [1,3],[1,6],[1,9],[1,11],
      [18,3],[18,6],[18,9],[18,11],
      [2,11],[6,11],[13,11],[17,11],
    ];
    TREE_POS.forEach(([tx, ty]) => {
      const cx = tx*TILE + TILE/2 + (r()-0.5)*4;
      const cy = ty*TILE + TILE/2;
      const s  = 0.88 + r()*0.24;
      // Bayangan pohon (offset sedikit ke kiri = sumber cahaya dari kanan atas)
      g.fillStyle(C.shadow, 0.13).fillEllipse(cx-3, cy+15, 28*s, 9*s);
      // Batang dengan serat cahaya
      g.fillStyle(C.woodDark).fillRect(cx-2.5*s, cy+2, 5*s, 14);
      g.fillStyle(C.wood, 0.45).fillRect(cx-1.5*s, cy+3, 1.5*s, 12);
      g.lineStyle(1, C.ink, 0.8).strokeRect(cx-2.5*s, cy+2, 5*s, 14);
      // 5 lapisan daun
      g.fillStyle(C.leafDark, 0.60).fillCircle(cx+1, cy,    12*s);     // bayangan bawah
      g.fillStyle(C.leaf,     0.90).fillCircle(cx,   cy-3,  11*s);     // massa utama
      g.fillStyle(C.leafHi,   0.68).fillCircle(cx-2*s, cy-7*s, 7.5*s); // kluster cerah
      g.fillStyle(C.leafHi,   0.42).fillCircle(cx+4*s, cy-4*s, 5*s);   // sisi
      g.fillStyle(0xd8f8b0,   0.24).fillCircle(cx-3*s, cy-10*s, 3.5*s);// specular
      g.lineStyle(1.5, C.ink, 0.55).strokeCircle(cx, cy-3, 11*s);
    });
  }

  /* -------- Bayangan awan bergerak (3 awan) -------- */
  makeClouds(){
    const defs = [
      { x:-90,           y:ROWS*TILE*0.28, w:200, h:65, a:0.07, s:0.18 },
      { x:COLS*TILE*0.7, y:ROWS*TILE*0.52, w:150, h:45, a:0.05, s:0.13 },
      { x:COLS*TILE*0.3, y:ROWS*TILE*0.14, w:240, h:70, a:0.06, s:0.15 },
    ];
    for (const d of defs)
      this.clouds.push({ obj:this.add.ellipse(d.x, d.y, d.w, d.h, C.shadow, d.a).setDepth(1.5), speed:d.s });
  }

  /* -------- Bangunan prosedural (gaya pixel-art bergaris tinta) -------- */
  drawBuildings(){
    const g = this.add.graphics().setDepth(3);
    SPOTS.forEach(s => {
      const cx = s.x*TILE + TILE/2;
      const cy = s.y*TILE + TILE/2;
      // Bayangan searah cahaya (offset kiri-bawah dari sumber kanan-atas)
      g.fillStyle(C.shadow, 0.15).fillEllipse(cx-4, cy+17, 42, 10);
      // Ambient occlusion di dasar bangunan
      g.fillStyle(C.shadow, 0.09).fillRect(cx-16, cy+7, 32, 5);
      switch(s.id){
        case 'kepala':    this._drawCottage(g, cx, cy);   break;
        case 'koperasi':  this._drawKoperasi(g, cx, cy);  break;
        case 'bendahara': this._drawTreasury(g, cx, cy);  break;
        case 'ladang':    this._drawField(g, cx, cy);     break;
        case 'pasar':     this._drawMarket(g, cx, cy);    break;
        case 'balai':     this._drawHall(g, cx, cy);      break;
        case 'well':      this._drawWell(g, cx, cy);      break;
      }
      const labelBg = s.deco ? '#9b9aa6' : '#e0a52b';
      this.add.text(cx, cy+19, s.name, {
        fontFamily:"'Pixelify Sans', 'Trebuchet MS', sans-serif",
        fontSize:'8px', fontStyle:'bold',
        color:'#241d2e', backgroundColor:labelBg,
        padding:{ x:4, y:2 },
      }).setOrigin(.5).setDepth(4).setAlpha(.95);
      if (s.id === 'koperasi'){
        this.add.rectangle(cx, cy-30, 2, 20, C.ink).setDepth(3.8).setOrigin(0.5, 1);
        // Bendera merah-putih
        const fg = this.add.graphics().setDepth(3.8);
        fg.fillStyle(C.roofRed, 1).fillRect(0, -4, 14, 4);
        fg.fillStyle(0xf0ede0,  1).fillRect(0,  0, 14, 4);
        fg.lineStyle(0.5, C.ink, 0.5).strokeRect(0, -4, 14, 8);
        fg.x = cx; fg.y = cy-45;
        this.tweens.add({ targets:fg, scaleX:{ from:1, to:0.6 }, duration:700, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
      }
    });
  }

  _drawCottage(g, cx, cy){
    // Dinding kayu
    g.fillStyle(C.wood).fillRoundedRect(cx-12, cy-4, 24, 17, 2);
    g.lineStyle(2, C.ink, 1).strokeRoundedRect(cx-12, cy-4, 24, 17, 2);
    g.fillStyle(0xd4a870, 0.45).fillRect(cx-11, cy-3, 22, 4);
    // Atap merah
    g.fillStyle(C.roofRed).fillTriangle(cx-14, cy-4, cx+14, cy-4, cx, cy-18);
    // Garis sirap atap
    g.lineStyle(0.8, 0x9e3020, 0.28);
    for (let ri=3; ri<14; ri+=3.5){ const ry=cy-18+ri; g.lineBetween(cx-ri,ry,cx+ri,ry); }
    g.lineStyle(2, C.ink, 1);
    g.strokePoints([{x:cx-14,y:cy-4},{x:cx+14,y:cy-4},{x:cx,y:cy-18}], true);
    g.fillStyle(C.woodDark, 0.4).fillRect(cx-14, cy-6, 28, 3);
    // Cerobong asap
    g.fillStyle(C.stoneDark).fillRect(cx+5, cy-22, 5, 8);
    g.lineStyle(1.5, C.ink, 1).strokeRect(cx+5, cy-22, 5, 8);
    g.fillStyle(C.stoneDark, 0.6).fillRect(cx+4, cy-25, 7, 4);
    g.lineStyle(1, C.ink, 0.8).strokeRect(cx+4, cy-25, 7, 4);
    // Pintu
    g.fillStyle(C.woodDark).fillRoundedRect(cx-4, cy-4, 8, 13, 1);
    g.lineStyle(1.5, C.ink, 1).strokeRoundedRect(cx-4, cy-4, 8, 13, 1);
    g.fillStyle(C.gold).fillCircle(cx+3, cy+3, 1.5);
    // Jendela dengan cahaya interior hangat
    g.fillStyle(0xffcc66, 0.28).fillRect(cx-12, cy-14, 9, 9);     // aura cahaya
    g.fillStyle(0xffe8a8, 0.90).fillRect(cx-11, cy-13, 7, 7);     // kaca hangat
    g.fillStyle(0xffaa33, 0.28).fillRect(cx-11, cy-13, 3, 3);     // sudut terang
    g.lineStyle(1, C.ink, 1).strokeRect(cx-11, cy-13, 7, 7);
    g.lineStyle(0.8, C.ink, 0.35).lineBetween(cx-7.5, cy-13, cx-7.5, cy-6);
    g.lineBetween(cx-11, cy-9.5, cx-4, cy-9.5);
  }

  _drawKoperasi(g, cx, cy){
    // Tangga/plinth
    g.fillStyle(C.stoneDark).fillRect(cx-16, cy+8, 32, 4);
    g.lineStyle(1.5, C.ink, 1).strokeRect(cx-16, cy+8, 32, 4);
    // Badan utama
    g.fillStyle(C.stone).fillRect(cx-12, cy-8, 24, 18);
    g.lineStyle(2, C.ink, 1).strokeRect(cx-12, cy-8, 24, 18);
    g.fillStyle(0xb8b7c4, 0.4).fillRect(cx-11, cy-7, 22, 4);
    // 2 Kolom
    [-8, 6].forEach(ox => {
      g.fillStyle(C.stone).fillRect(cx+ox, cy-18, 5, 28);
      g.lineStyle(1.5, C.ink, 1).strokeRect(cx+ox, cy-18, 5, 28);
      g.fillStyle(0xb8b7c4, 0.3).fillRect(cx+ox, cy-18, 2, 28);
    });
    // Entablature
    g.fillStyle(C.stoneDark).fillRect(cx-15, cy-20, 30, 4);
    g.lineStyle(2, C.ink, 1).strokeRect(cx-15, cy-20, 30, 4);
    // Pedimen segitiga
    g.fillStyle(C.stone).fillTriangle(cx-16, cy-20, cx+16, cy-20, cx, cy-30);
    // Garis profil pedimen
    g.lineStyle(0.7, C.stoneDark, 0.25);
    for (let ri=2; ri<9; ri+=2.5){ const ry=cy-30+ri; const hw=ri*1.6; g.lineBetween(cx-hw,ry,cx+hw,ry); }
    g.lineStyle(2, C.ink, 1);
    g.strokePoints([{x:cx-16,y:cy-20},{x:cx+16,y:cy-20},{x:cx,y:cy-30}], true);
    // Papan nama di atas pintu
    g.fillStyle(C.goldDark, 0.85).fillRect(cx-7, cy-10, 14, 4);
    g.lineStyle(1, C.ink, 0.7).strokeRect(cx-7, cy-10, 14, 4);
    g.fillStyle(C.gold, 0.55).fillRect(cx-6, cy-9.5, 12, 1.5);
    // Pintu masuk dengan kaca atas
    g.fillStyle(C.shadow, 0.45).fillRoundedRect(cx-4, cy-6, 8, 14, 1);
    g.fillStyle(0xffe8a8, 0.35).fillRect(cx-3, cy-6, 6, 4);
  }

  _drawTreasury(g, cx, cy){
    // Alas/plinth batu
    g.fillStyle(C.stoneDark).fillRect(cx-13, cy+9, 26, 4);
    g.lineStyle(1.5, C.ink, 1).strokeRect(cx-13, cy+9, 26, 4);
    // Badan gedung batu
    g.fillStyle(C.stone).fillRect(cx-11, cy-6, 22, 17);
    g.lineStyle(2, C.ink, 1).strokeRect(cx-11, cy-6, 22, 17);
    g.fillStyle(0xb8b7c4, 0.35).fillRect(cx-10, cy-5, 20, 4);
    // Entablatur
    g.fillStyle(C.stoneDark).fillRect(cx-13, cy-8, 26, 4);
    g.lineStyle(2, C.ink, 1).strokeRect(cx-13, cy-8, 26, 4);
    // Pedimen segitiga
    g.fillStyle(C.stone).fillTriangle(cx-13, cy-8, cx+13, cy-8, cx, cy-18);
    g.lineStyle(0.7, C.stoneDark, 0.22);
    for (let ri=2; ri<9; ri+=2.8){ const ry=cy-18+ri; const hw=ri*1.3; g.lineBetween(cx-hw,ry,cx+hw,ry); }
    g.lineStyle(2, C.ink, 1).strokePoints([{x:cx-13,y:cy-8},{x:cx+13,y:cy-8},{x:cx,y:cy-18}], true);
    // Pintu brankas: lengkungan di atas + badan persegi
    const dx=cx, dy=cy-2;
    g.fillStyle(C.shadow, 0.62).fillCircle(dx, dy, 5.5);
    g.fillStyle(C.shadow, 0.62).fillRect(dx-5.5, dy, 11, 8);
    g.lineStyle(2, C.ink, 0.9).strokeCircle(dx, dy, 5.5);
    g.lineBetween(dx-5.5, dy, dx-5.5, dy+8);
    g.lineBetween(dx+5.5, dy, dx+5.5, dy+8);
    g.lineBetween(dx-5.5, dy+8, dx+5.5, dy+8);
    // Baut pintu (sudut)
    g.fillStyle(C.gold, 0.75);
    [[-3,-4],[3,-4],[-3,3],[3,3]].forEach(([bx,by]) => g.fillCircle(dx+bx, dy+by, 1.5));
    // Lubang kunci
    g.fillStyle(C.goldDark).fillCircle(dx, dy+6, 2);
    g.fillStyle(C.goldDark).fillRect(dx-1, dy+7, 2, 3);
    // Koin emas di dasar (simbol kekayaan)
    [-6,-1,4].forEach(ox => {
      g.fillStyle(C.gold, 0.78).fillCircle(cx+ox, cy+11, 2.5);
      g.lineStyle(0.5, C.goldDark, 0.65).strokeCircle(cx+ox, cy+11, 2.5);
    });
  }

  _drawField(g, cx, cy){
    // Pagar kayu kiri & kanan
    g.fillStyle(C.wood).fillRect(cx-14, cy-16, 3, 32);
    g.lineStyle(1, C.ink, 0.9).strokeRect(cx-14, cy-16, 3, 32);
    g.fillStyle(C.wood).fillRect(cx+11, cy-16, 3, 32);
    g.lineStyle(1, C.ink, 0.9).strokeRect(cx+11, cy-16, 3, 32);
    // Rel pagar horizontal
    g.fillStyle(C.woodDark, 0.5).fillRect(cx-14, cy-11, 28, 1.5);
    g.fillStyle(C.woodDark, 0.5).fillRect(cx-14, cy+6,  28, 1.5);

    // Saluran irigasi antar baris
    g.fillStyle(0x4878b0, 0.55).fillRect(cx-11, cy-8, 22, 2);
    g.fillStyle(0x7ab0e8, 0.30).fillRect(cx-11, cy-8, 22, 1);
    g.fillStyle(0x4878b0, 0.55).fillRect(cx-11, cy+0, 22, 2);
    g.fillStyle(0x7ab0e8, 0.30).fillRect(cx-11, cy+0, 22, 1);

    // 3 baris tanah sawah dengan tanaman
    [cy-14, cy-6, cy+2].forEach(ry => {
      // Tanah subur
      g.fillStyle(0x7a4f26).fillRect(cx-11, ry, 22, 6);
      g.fillStyle(0x9e6a3a, 0.3).fillRect(cx-10, ry+1, 20, 2);
      g.lineStyle(0.5, C.ink, 0.18).strokeRect(cx-11, ry, 22, 6);
      // 3 tanaman padi per baris
      for (let i=0; i<3; i++){
        const px = cx-8 + i*8;
        const by = ry + 1;
        // Batang padi
        g.fillStyle(0x6e8835, 0.85).fillRect(px-0.5, by+1, 1, 4);
        // Daun kiri & kanan (garis diagonal)
        g.lineStyle(1.5, C.leaf,   0.85).lineBetween(px, by+2, px-3, by-1);
        g.lineStyle(1.5, C.leafHi, 0.75).lineBetween(px, by+2, px+3, by-1);
        // Bulir gabah di pucuk
        g.fillStyle(0xc8a840, 1).fillCircle(px, by-1, 2);
        g.fillStyle(0xefd070, 0.55).fillCircle(px-0.5, by-1.5, 0.9);
      }
    });

    // Orang-orangan sawah (pojok kiri atas)
    const sx = cx-8, sy = cy-18;
    g.fillStyle(C.woodDark).fillRect(sx-0.5, sy, 1, 10);     // tiang vertikal
    g.fillStyle(C.woodDark).fillRect(sx-5, sy+2, 10, 1);     // palang horizontal
    g.fillStyle(0xc8a040, 0.7).fillCircle(sx-5, sy+2, 2);    // jerami kiri
    g.fillStyle(0xc8a040, 0.7).fillCircle(sx+5, sy+2, 2);    // jerami kanan
    g.fillStyle(0xe0c080, 0.9).fillCircle(sx, sy-1, 3.5);    // kepala
    g.lineStyle(0.5, C.ink, 0.65).strokeCircle(sx, sy-1, 3.5);
    // Topi
    g.fillStyle(0x3d2210).fillTriangle(sx-3, sy-1, sx+3, sy-1, sx, sy-6);
    g.lineStyle(0.5, C.ink, 0.55).strokePoints(
      [{x:sx-3,y:sy-1},{x:sx+3,y:sy-1},{x:sx,y:sy-6}], true);
    // Senyum kecil
    g.lineStyle(0.8, C.ink, 0.6).lineBetween(sx-1.5, sy+1, sx,   sy+2);
    g.lineBetween(sx, sy+2, sx+1.5, sy+1);
  }

  _drawMarket(g, cx, cy){
    // Badan warung
    g.fillStyle(C.wood).fillRoundedRect(cx-13, cy-2, 26, 14, 2);
    g.lineStyle(2, C.ink, 1).strokeRoundedRect(cx-13, cy-2, 26, 14, 2);
    g.fillStyle(0xd4a870, 0.4).fillRect(cx-12, cy-1, 24, 3);
    // Meja counter
    g.fillStyle(C.woodDark).fillRect(cx-13, cy-2, 26, 4);
    g.lineStyle(1, C.ink, 1).strokeRect(cx-13, cy-2, 26, 4);
    // Kanopi
    g.fillStyle(C.roofTeal).fillTriangle(cx-15, cy-2, cx+15, cy-2, cx, cy-15);
    // Garis kanopi horizontal
    g.lineStyle(0.8, 0x2d7a7a, 0.28);
    for (let ri=2; ri<12; ri+=3){ const ry=cy-15+ri; const hw=ri*15/13; g.lineBetween(cx-hw,ry,cx+hw,ry); }
    g.lineStyle(2, C.ink, 1);
    g.strokePoints([{x:cx-15,y:cy-2},{x:cx+15,y:cy-2},{x:cx,y:cy-15}], true);
    g.fillStyle(0x6cc4c4, 0.35).fillTriangle(cx-13, cy-2, cx+13, cy-2, cx, cy-13);
    // Rumbai scallop di bawah kanopi
    [-12,-8,-4,0,4,8,12].forEach((ox,i) => {
      g.fillStyle(i%2===0 ? C.roofTeal : 0x2d7a7a, 0.92).fillCircle(cx+ox, cy-1, 3.2);
      g.lineStyle(0.5, C.ink, 0.4).strokeCircle(cx+ox, cy-1, 3.2);
    });
    // Barang dagangan di counter
    [C.coral, C.success, C.gold].forEach((gc, i) => {
      g.fillStyle(gc).fillCircle(cx-7+i*7, cy, 3);
      g.lineStyle(1, C.ink, 1).strokeCircle(cx-7+i*7, cy, 3);
    });
  }

  _drawHall(g, cx, cy){
    // Tangga
    g.fillStyle(C.stoneDark).fillRect(cx-17, cy+8, 34, 4);
    g.lineStyle(2, C.ink, 1).strokeRect(cx-17, cy+8, 34, 4);
    // Badan utama
    g.fillStyle(C.stone).fillRect(cx-13, cy-8, 26, 18);
    g.lineStyle(2, C.ink, 1).strokeRect(cx-13, cy-8, 26, 18);
    g.fillStyle(0xb8b7c4, 0.35).fillRect(cx-12, cy-7, 24, 4);
    // 3 Kolom
    [-10, 0, 10].forEach(ox => {
      g.fillStyle(C.stone).fillRect(cx+ox-2.5, cy-20, 5, 30);
      g.lineStyle(1.5, C.ink, 1).strokeRect(cx+ox-2.5, cy-20, 5, 30);
      g.fillStyle(0xb8b7c4, 0.3).fillRect(cx+ox-2.5, cy-20, 2, 30);
      // Kepala kolom
      g.fillStyle(C.stoneDark).fillRect(cx+ox-4, cy-22, 9, 3);
      g.lineStyle(1, C.ink, 1).strokeRect(cx+ox-4, cy-22, 9, 3);
    });
    // Entablature
    g.fillStyle(C.stoneDark).fillRect(cx-17, cy-22, 34, 4);
    g.lineStyle(2, C.ink, 1).strokeRect(cx-17, cy-22, 34, 4);
    // Pedimen
    g.fillStyle(C.stone).fillTriangle(cx-17, cy-22, cx+17, cy-22, cx, cy-34);
    // Garis profil pedimen balai
    g.lineStyle(0.7, C.stoneDark, 0.22);
    for (let ri=2; ri<11; ri+=3){ const ry=cy-34+ri; const hw=ri*17/12; g.lineBetween(cx-hw,ry,cx+hw,ry); }
    g.lineStyle(2, C.ink, 1);
    g.strokePoints([{x:cx-17,y:cy-22},{x:cx+17,y:cy-22},{x:cx,y:cy-34}], true);
    // Jendela kiri & kanan dari pintu
    [-11, 8].forEach(ox => {
      g.fillStyle(0xffcc66, 0.22).fillRect(cx+ox-1, cy-7, 7, 7);
      g.fillStyle(0xffe8a8, 0.80).fillRect(cx+ox,   cy-6, 5, 5);
      g.lineStyle(1, C.ink, 0.9).strokeRect(cx+ox, cy-6, 5, 5);
      g.lineStyle(0.6, C.ink, 0.3).lineBetween(cx+ox+2.5, cy-6, cx+ox+2.5, cy-1);
    });
    // Pintu
    g.fillStyle(C.shadow, 0.4).fillRoundedRect(cx-5, cy-8, 10, 18, 1);
  }

  /* -------- Prop dekoratif ambien di sekitar bangunan -------- */
  drawPropsDecor(){
    const g = this.add.graphics().setDepth(2.2);
    const rp = rng(7711);

    const pasar = SPOTS.find(s => s.id==='pasar');
    if (pasar){
      const cx = pasar.x*TILE+TILE/2, cy = pasar.y*TILE+TILE/2;
      this._drawBarrel(g, cx-TILE*0.78, cy+4);
      this._drawCrate(g, cx+TILE*0.78, cy+5);
      // Kios pasar dengan atap kecil
      const STALLS = [
        { ox:-TILE*1.1, oc:C.roofRed,  goods:[0xff5050,0xffaa33,0xffee44] },
        { ox: TILE*1.3, oc:C.roofBlue, goods:[0x55aaff,0xaaeebb,0xffcc88] },
      ];
      for (const s of STALLS){
        const sx = cx+s.ox, sy = cy+4;
        g.fillStyle(s.oc, 0.88).fillTriangle(sx-2, sy-10, sx+20, sy-10, sx+10, sy-20);
        g.fillStyle(s.oc, 0.5).fillRect(sx-2, sy-13, 22, 4);
        g.lineStyle(0.7, C.ink, 0.38).strokeTriangle(sx-2, sy-10, sx+20, sy-10, sx+10, sy-20);
        g.fillStyle(C.wood).fillRect(sx+1, sy-8, 18, 4);
        g.lineStyle(0.6, C.ink, 0.4).strokeRect(sx+1, sy-8, 18, 4);
        s.goods.forEach((gc, gi) => g.fillStyle(gc, 0.82).fillCircle(sx+5+gi*5, sy-6, 2));
        g.fillStyle(C.woodDark).fillRect(sx+1, sy-8, 1.5, 10).fillRect(sx+18, sy-8, 1.5, 10);
      }
    }

    const balai = SPOTS.find(s => s.id==='balai');
    if (balai){
      const cx = balai.x*TILE+TILE/2, cy = balai.y*TILE+TILE/2;
      [-20,14].forEach(ox => {
        g.fillStyle(C.stone).fillRoundedRect(cx+ox, cy+9, 8, 5, 2);
        g.lineStyle(1, C.ink, 0.7).strokeRoundedRect(cx+ox, cy+9, 8, 5, 2);
        g.fillStyle(0xb8b7c4, 0.4).fillRect(cx+ox+1, cy+9, 6, 1.5);
      });
    }

    const bendahara = SPOTS.find(s => s.id==='bendahara');
    if (bendahara){
      const cx = bendahara.x*TILE+TILE/2, cy = bendahara.y*TILE+TILE/2;
      const rc = rng(7788);
      for (let ci=0; ci<5; ci++){
        const gx = cx-13 + rc()*26, gy = cy+11 + rc()*5;
        g.fillStyle(C.gold, 0.6+rc()*0.25).fillCircle(gx, gy, 2.2);
        g.lineStyle(0.5, C.goldDark, 0.5).strokeCircle(gx, gy, 2.2);
      }
    }

    // Tiang lampu jalan di persimpangan utama
    const LAMP_POS = [
      [9*TILE,   5*TILE-2],
      [11*TILE,  5*TILE-2],
      [9*TILE,  10*TILE-2],
      [11*TILE, 10*TILE-2],
    ];
    for (const [lx, ly] of LAMP_POS){
      g.fillStyle(C.ink, 0.88).fillRect(lx, ly-22, 2, 24);
      g.fillStyle(C.ink, 0.88).fillRect(lx, ly-22, 9, 2);
      g.fillStyle(C.goldDark).fillRoundedRect(lx+6, ly-28, 7, 8, 1);
      g.fillStyle(0xffee44, 0.6).fillRoundedRect(lx+7, ly-27, 5, 6, 0.5);
      g.lineStyle(0.5, C.ink, 0.45).strokeRoundedRect(lx+6, ly-28, 7, 8, 1);
      g.fillStyle(C.stoneDark).fillRect(lx-1, ly+1, 4, 2);
      const glow = this.add.rectangle(lx+9, ly-24, 5, 6, 0xffee44).setDepth(3.06).setAlpha(0.38);
      this.windowGlows.push({ obj:glow, base:0.30, rate:0.0018+rp()*0.001, phase:rp()*Math.PI*2, amp:0.17 });
    }

    // Barisan padi dekat Ladang (baris rumput di timur ladang)
    const ladang = SPOTS.find(s => s.id==='ladang');
    if (ladang){
      const fx = ladang.x*TILE + TILE*1.1, fy = ladang.y*TILE - TILE*0.8;
      for (let row = 0; row < 4; row++){
        for (let col = 0; col < 7; col++){
          const px = fx + col*9, py = fy + row*11;
          const th = 4 + (rp()*4)|0;
          g.fillStyle(0x3d9e3a, 0.75).fillRect(px+1, py, 2, th);
          g.fillStyle(0x88cc44, 0.55).fillTriangle(px-1, py+2, px+5, py+2, px+2, py-3);
          g.fillStyle(0x6ec43c, 0.4).fillRect(px+1, py-1, 1, 3);
        }
      }
    }

    // Tanda batu penunjuk jalan di sudut jalur
    const MILESTONES = [
      [3*TILE+TILE/2, 10*TILE+2],
      [16*TILE+TILE/2, 10*TILE+2],
    ];
    for (const [mx, my] of MILESTONES){
      g.fillStyle(C.stone).fillRoundedRect(mx-3, my-9, 7, 11, 1);
      g.fillStyle(0xb8b7c4, 0.38).fillRect(mx-2, my-8, 5, 3);
      g.lineStyle(0.6, C.ink, 0.3).strokeRoundedRect(mx-3, my-9, 7, 11, 1);
    }

    // Kotak bunga + jemuran di cottage Kepala Desa
    const kepala = SPOTS.find(s => s.id==='kepala');
    if (kepala){
      const cx = kepala.x*TILE+TILE/2, cy = kepala.y*TILE+TILE/2;
      // Kotak bunga di bawah jendela (jendela di cx-11, cy-13, 7×7)
      g.fillStyle(C.woodDark, 0.85).fillRoundedRect(cx-12, cy-7, 9, 3, 1);
      g.lineStyle(0.5, C.ink, 0.45).strokeRoundedRect(cx-12, cy-7, 9, 3, 1);
      g.fillStyle(C.roofRed,  0.9).fillCircle(cx-10, cy-9, 1.8);
      g.fillStyle(0xffffff,   0.9).fillCircle(cx-7,  cy-9, 1.8);
      g.fillStyle(C.gold,     0.9).fillCircle(cx-4,  cy-9, 1.8);
      g.fillStyle(C.leaf,     0.7).fillRect(cx-12, cy-8, 9, 1.5);
      // Tali jemuran di samping cottage
      g.lineStyle(0.7, C.woodDark, 0.50).lineBetween(cx+14, cy-8, cx+30, cy-8);
      const CLOTHES = [{ ox:17, col:C.roofTeal }, { ox:24, col:C.coral }];
      for (const cl of CLOTHES){
        const clx = cx+cl.ox, cly = cy-8;
        g.fillStyle(C.woodDark, 0.45).fillRect(clx-0.4, cly, 0.8, 2);
        g.fillStyle(cl.col, 0.80).fillRect(clx-3, cly+2, 6, 5);
        g.fillStyle(cl.col, 0.60).fillRect(clx-5, cly+3, 2, 3).fillRect(clx+3, cly+3, 2, 3);
        g.lineStyle(0.5, C.ink, 0.3).strokeRect(clx-3, cly+2, 6, 5);
      }
    }

    // Pot tanaman di depan Koperasi
    const koperasi = SPOTS.find(s => s.id==='koperasi');
    if (koperasi){
      const kx = koperasi.x*TILE+TILE/2, ky = koperasi.y*TILE+TILE/2;
      for (const ox of [-20, 18]){
        const px = kx+ox, py = ky+9;
        g.fillStyle(C.roofRed, 0.82).fillRoundedRect(px-3.5, py, 7, 6, 1);
        g.fillStyle(0x8a2c10, 0.35).fillRect(px-3, py+3, 6, 2);
        g.lineStyle(0.5, C.ink, 0.4).strokeRoundedRect(px-3.5, py, 7, 6, 1);
        g.fillStyle(0x5a3a10, 0.65).fillRect(px-2, py, 4, 2);
        g.fillStyle(C.leafDark, 0.82).fillCircle(px, py-3, 4);
        g.fillStyle(C.leafHi, 0.5).fillCircle(px-1.5, py-4, 2);
      }
    }

    // Dermaga kecil di tepi selatan (baris 12 → 13)
    const DOCK_X = 5*TILE + TILE/2, DOCK_Y = 13*TILE;
    const gd = this.add.graphics().setDepth(2.0);
    // Papan lantai dermaga
    gd.fillStyle(C.woodDark, 0.80).fillRect(DOCK_X-9, DOCK_Y-2, 18, 24);
    gd.fillStyle(C.wood, 0.28).fillRect(DOCK_X-8, DOCK_Y, 16, 4);
    gd.lineStyle(0.8, C.ink, 0.50).strokeRect(DOCK_X-9, DOCK_Y-2, 18, 24);
    // Papan melintang
    for (let row=0; row<4; row++) gd.lineStyle(0.5, C.ink, 0.22).lineBetween(DOCK_X-9, DOCK_Y+4+row*5, DOCK_X+9, DOCK_Y+4+row*5);
    // Tiang patok
    [-9, 9].forEach(ox => {
      gd.fillStyle(C.ink, 0.45).fillRect(DOCK_X+ox-1, DOCK_Y, 2, 24);
      gd.fillStyle(C.woodDark, 0.65).fillRect(DOCK_X+ox-0.5, DOCK_Y, 1, 24);
    });
    // Pelampung kecil di ujung
    gd.fillStyle(0x3a70a0, 0.62).fillCircle(DOCK_X, DOCK_Y+21, 3.2);
    gd.fillStyle(0x7ab0d8, 0.35).fillCircle(DOCK_X-0.8, DOCK_Y+20, 1.5);
    gd.lineStyle(0.5, C.ink, 0.4).strokeCircle(DOCK_X, DOCK_Y+21, 3.2);

    // Papan penanda masuk desa (tiang + papan kayu di barat jalur utara)
    const sx = 7*TILE + TILE*0.62, sy = 2*TILE + TILE*0.55;
    const gsg = this.add.graphics().setDepth(2.25);
    gsg.fillStyle(C.woodDark, 0.88).fillRect(sx-1, sy-18, 2, 20);
    gsg.lineStyle(0.5, C.ink, 0.5).strokeRect(sx-1, sy-18, 2, 20);
    gsg.fillStyle(C.wood, 0.86).fillRoundedRect(sx-15, sy-24, 30, 9, 1);
    gsg.fillStyle(0xd4a870, 0.30).fillRect(sx-14, sy-23, 28, 2);
    gsg.fillStyle(C.woodDark, 0.15).fillRect(sx-14, sy-18, 28, 2);
    gsg.lineStyle(0.8, C.ink, 0.58).strokeRoundedRect(sx-15, sy-24, 30, 9, 1);
    // Motif ukiran kecil di papan
    gsg.fillStyle(C.gold, 0.28).fillCircle(sx, sy-19, 2.5);
    gsg.lineStyle(0.5, C.goldDark, 0.30).strokeCircle(sx, sy-19, 2.5);
    gsg.fillStyle(C.gold, 0.18).fillRect(sx-10, sy-20, 6, 1).fillRect(sx+4, sy-20, 6, 1);
  }

  _drawBarrel(g, cx, cy){
    g.fillStyle(C.woodDark).fillRoundedRect(cx-5, cy-7, 10, 13, 2);
    g.lineStyle(1, C.ink, 0.9).strokeRoundedRect(cx-5, cy-7, 10, 13, 2);
    g.fillStyle(0x9e6e3c, 0.28).fillRect(cx-4, cy-6, 8, 2);
    g.fillStyle(C.stoneDark, 0.50).fillRect(cx-5, cy-3, 10, 1.5);
    g.fillStyle(C.stoneDark, 0.50).fillRect(cx-5, cy+1, 10, 1.5);
    g.fillStyle(C.wood, 0.18).fillRect(cx-4, cy-5, 3, 10);
  }

  _drawCrate(g, cx, cy){
    g.fillStyle(C.wood).fillRect(cx-6, cy-5, 12, 10);
    g.lineStyle(1, C.ink, 0.9).strokeRect(cx-6, cy-5, 12, 10);
    g.lineStyle(0.8, C.woodDark, 0.5).lineBetween(cx-6, cy, cx+6, cy);
    g.lineBetween(cx, cy-5, cx, cy+5);
    g.fillStyle(C.wood, 0.25).fillRect(cx-5, cy-4, 4, 4);
  }

  /* -------- Obor / lentera dekoratif di dekat bangunan -------- */
  makeTorches(){
    const rn = rng(444);
    const T  = TILE;
    const addT = (sx, sy) => this.torches.push({
      glow:  this.add.graphics().setDepth(3.4),
      flame: this.add.graphics().setDepth(3.5),
      sx, sy, phase: rn()*Math.PI*2,
    });
    SPOTS.forEach(s => {
      const cx = s.x*T + T/2, cy = s.y*T + T/2;
      if (s.id === 'balai')    { addT(cx-T*0.85, cy+T*0.1); addT(cx+T*0.85, cy+T*0.1); }
      if (s.id === 'pasar')    { addT(cx-T*1.0,  cy);        addT(cx+T*1.0,  cy); }
      if (s.id === 'koperasi') { addT(cx-T*0.85, cy-T*0.4); }
    });
  }

  /* -------- Penanda tujuan -------- */
  makeMarker(){
    this.ring = this.add.circle(0, 0, 22, C.gold, 0.18).setDepth(2).setVisible(false);
    this.tweens.add({ targets:this.ring, scale:{ from:0.8, to:1.25 }, alpha:{ from:0.28, to:0.05 },
      duration:1000, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    this.arrow = this.add.text(0, 0, '▼', {
      fontFamily:"'Pixelify Sans','Trebuchet MS',sans-serif",
      fontSize:'18px', color:'#e0a52b', stroke:'#14101c', strokeThickness:3,
    }).setOrigin(.5).setDepth(7).setVisible(false);
    this.tweens.add({ targets:this.arrow, y:'+=6', duration:600, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
  }

  /* -------- Karakter pemain prosedural -------- */
  makePlayer(){
    this.px = 10; this.py = 11;
    this.pFacing = 1; // 1=kanan, -1=kiri
    this._makeCharTextures();

    const c = this.add.container(this.px*TILE+TILE/2, this.py*TILE+TILE/2).setDepth(2.5 + this.py/ROWS*4);
    this.pShadow = this.add.ellipse(0, 12, 26, 10, C.shadow, 0.35);
    this.pBody   = this.add.image(0, 0, 'char_i').setOrigin(0.5, 0.75);
    c.add([this.pShadow, this.pBody]);
    this.pc = c;
    this.moving = false;
    this.stepCount = 0;
    // Bob idle
    this.tweens.add({ targets:this.pBody, y:-3, duration:900, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    this.scheduleBlink();
    this.updateMarker();
  }

  scheduleBlink(){
    const delay = 3200 + Math.random() * 4400;
    this.time.delayedCall(delay, () => {
      if (this.pBody && !this.moving){
        const prev = this.pBody.texture.key;
        if (prev === 'char_i'){
          this.pBody.setTexture('char_blink');
          this.time.delayedCall(105, () => {
            if (this.pBody && this.pBody.texture.key === 'char_blink')
              this.pBody.setTexture('char_i');
          });
        }
      }
      this.scheduleBlink();
    });
  }

  _makeCharTextures(){
    if (this.textures.exists('char_i')) return;
    // fi: 0=idle-front, 1=walkL-front, 2=walkR-front, 3=idle-back, 4=walkL-back, 5=walkR-back, 6=blink
    ['char_i','char_wL','char_wR','char_u','char_uL','char_uR','char_blink'].forEach((key, fi) => {
      const g = this.add.graphics({ x:0, y:0 });
      const back  = fi >= 3 && fi <= 5;  // fi=6 (blink) tetap tampak depan
      const stepL = fi === 1 || fi === 4;
      const stepR = fi === 2 || fi === 5;
      const walk  = stepL || stepR;

      // Posisi kaki berdasarkan langkah
      const llx = walk ? 6 : 8,  rlx = walk ? 17 : 15;
      const lly = stepL ? 25 : (stepR ? 29 : 27);   // kaki kiri Y (lebih tinggi = maju)
      const rly = stepR ? 25 : (stepL ? 29 : 27);   // kaki kanan Y
      const llh = stepL ? 13 : (stepR ? 9  : 11);   // tinggi kaki kiri
      const rlh = stepR ? 13 : (stepL ? 9  : 11);   // tinggi kaki kanan
      const lsx = walk ? 5 : 7, rsx = walk ? 16 : 14;
      const lsy = stepL ? 36 : (stepR ? 38 : 37);
      const rsy = stepR ? 36 : (stepL ? 38 : 37);

      // Sepatu dengan ujung tebal
      g.fillStyle(C.ink).fillRoundedRect(lsx-1, lsy, 9, 5, 1).fillRoundedRect(rsx-1, rsy, 9, 5, 1);
      g.fillStyle(C.woodDark).fillRect(lsx, lsy, 7, 4).fillRect(rsx, rsy, 7, 4);

      // Kaki (celana)
      g.fillStyle(C.pants).fillRect(llx, lly, 5, llh).fillRect(rlx, rly, 5, rlh);
      g.lineStyle(1.5, C.ink, 1).strokeRect(llx, lly, 5, llh).strokeRect(rlx, rly, 5, rlh);
      // Lipatan celana
      g.fillStyle(C.ink, 0.1).fillRect(llx+1, lly+llh-3, 3, 2).fillRect(rlx+1, rly+rlh-3, 3, 2);

      // Ikat pinggang
      g.fillStyle(C.woodDark, 0.65).fillRect(7, 27, 14, 2);
      g.fillStyle(C.gold, 0.85).fillRect(12, 26.5, 4, 3);

      // Badan (tunik) dengan bayangan sisi
      g.fillStyle(C.tunic).fillRoundedRect(7, 16, 14, 13, 2);
      if (!back){
        g.fillStyle(C.tunicHi, 0.50).fillRect(8, 17, 12, 3);         // highlight pundak
        g.fillStyle(C.ink, 0.08).fillRect(15, 17, 5, 12);            // bayangan sisi kanan
        // Kerah V
        g.fillStyle(C.skin, 0.7).fillTriangle(12,16, 16,16, 14,20);
      } else {
        g.fillStyle(C.woodDark, 0.12).fillRect(8, 17, 12, 3);
      }
      g.lineStyle(1.5, C.ink, 1).strokeRoundedRect(7, 16, 14, 13, 2);

      // Lengan dengan manset
      const aLx = stepL ? 2 : (stepR ? 4 : 3);  // lengan kiri sedikit bergerak
      const aRx = stepR ? 21 : (stepL ? 19 : 20);
      g.fillStyle(C.tunic).fillRoundedRect(aLx, 17, 5, 9, 1).fillRoundedRect(aRx, 17, 5, 9, 1);
      g.lineStyle(1.5, C.ink, 1).strokeRoundedRect(aLx, 17, 5, 9, 1).strokeRoundedRect(aRx, 17, 5, 9, 1);
      // Manset lengan
      g.fillStyle(C.ink, 0.18).fillRect(aLx+1, 24, 3, 2).fillRect(aRx+1, 24, 3, 2);

      // Leher
      g.fillStyle(C.skin).fillRect(11, 14, 6, 4);
      // Syal wanderer (identitas visual khas)
      g.fillStyle(0xc84820, 0.92).fillRoundedRect(9, 15, 10, 3, 1);
      g.fillStyle(0xe86030, 0.7).fillRect(10, 14.5, 8, 1);
      if (!back){
        g.fillStyle(0xc84820, 0.75).fillTriangle(9,16, 12,16, 10,21);
        g.fillStyle(0xc84820, 0.65).fillTriangle(16,16, 19,16, 17,20);
      } else {
        g.fillStyle(0xc84820, 0.7).fillRect(8, 16, 12, 5);
        g.fillStyle(0xe86030, 0.4).fillRect(9, 16, 10, 2);
      }

      // Kepala dengan bayangan sisi
      g.fillStyle(C.skin).fillCircle(14, 9, 8);
      g.fillStyle(C.skinShade, 0.30).fillCircle(17, 11, 5);
      g.lineStyle(2, C.ink, 1).strokeCircle(14, 9, 8);

      if (back){
        // Belakang: rambut penuh + highlight
        g.fillStyle(C.hair).fillCircle(14, 9, 7.5).fillRoundedRect(6, 3, 16, 9, 3);
        g.fillStyle(0x6e4e3a, 0.35).fillCircle(17, 6, 3.5);
        g.fillStyle(0x9e7e5a, 0.25).fillCircle(10, 5, 3);
      } else {
        // Depan: rambut, mata, alis
        g.fillStyle(C.hair).fillRoundedRect(6, 1, 16, 9, 4);
        // Highlight rambut
        g.fillStyle(0x9e7e5a, 0.3).fillCircle(10, 4, 3.5);
        // Alis
        g.fillStyle(C.hair, 0.85).fillRect(10, 7, 3, 1).fillRect(16, 7, 3, 1);
        // Mata (tertutup saat blink, fi===6)
        if (fi === 6){
          g.fillStyle(C.ink, 0.9).fillRect(10, 10, 4, 1).fillRect(15, 10, 4, 1);
        } else {
          g.fillStyle(C.ink).fillRect(11, 9, 2, 2).fillRect(16, 9, 2, 2);
          g.fillStyle(0xffffff, 0.75).fillRect(11, 9, 1, 1).fillRect(16, 9, 1, 1);
        }
        // Hidung kecil
        g.fillStyle(C.skinShade, 0.45).fillRect(14, 12, 1, 1);
      }

      g.generateTexture(key, 28, 42);
      g.destroy();
    });
  }

  /* -------- Partikel pollen melayang -------- */
  makePollen(){
    const r = rng(99);
    const colors = [C.foam, C.foam, 0xfffacd, C.gold, C.foam, 0xfff0b0];
    for (let i=0; i<10; i++){
      const x = r() * COLS*TILE;
      const y = 30 + r() * (ROWS*TILE - 60);
      const col = colors[(r()*colors.length)|0];
      const rad = 1.4 + r()*0.8;
      const dot = this.add.arc(x, y, rad, 0, 360, false, col, 0.38+r()*0.28).setDepth(5);
      this.pollen.push({ obj:dot, ox:x, oy:y, sp:0.11+r()*0.22, ph:r()*Math.PI*2 });
    }
  }

  /* -------- Cahaya jendela berkedip (di atas grafis bangunan statis) -------- */
  makeWindowGlows(){
    const r = rng(2288);
    SPOTS.forEach(s => {
      const cx = s.x*TILE+TILE/2, cy = s.y*TILE+TILE/2;
      if (s.id === 'kepala'){
        // Jendela cottage: fillRect(cx-11, cy-13, 7, 7)
        const g = this.add.rectangle(cx-7.5, cy-9.5, 5, 5, 0xffdd88).setDepth(3.05).setAlpha(0.4);
        this.windowGlows.push({ obj:g, phase: r()*Math.PI*2, rate:0.0019+r()*0.0008, base:0.30, amp:0.28 });
      }
      if (s.id === 'balai'){
        // Jendela balai: fillRect(cx+ox, cy-6, 5, 5) untuk ox=-11 dan ox=8
        [-11, 8].forEach((ox, i) => {
          const g = this.add.rectangle(cx+ox+2.5, cy-3.5, 3, 3, 0xffdd88).setDepth(3.05).setAlpha(0.35);
          this.windowGlows.push({ obj:g, phase: r()*Math.PI*2 + i*1.4, rate:0.0017+r()*0.0007, base:0.22, amp:0.22 });
        });
      }
      if (s.id === 'koperasi'){
        // Kaca pintu: fillRect(cx-3, cy-6, 6, 4)
        const g = this.add.rectangle(cx, cy-4, 4, 2, 0xddeeff).setDepth(3.05).setAlpha(0.20);
        this.windowGlows.push({ obj:g, phase: r()*Math.PI*2, rate:0.0013+r()*0.0005, base:0.12, amp:0.14 });
      }
    });
  }

  /* -------- Asap cerobong beranimasi -------- */
  makeSmoke(){
    const kepala = SPOTS.find(s => s.id === 'kepala');
    if (!kepala) return;
    const sx = kepala.x * TILE + TILE/2 + 7;
    const sy = kepala.y * TILE + TILE/2 - 26;
    const r = rng(55);
    for (let i = 0; i < 8; i++){
      const dot = this.add.circle(sx, sy, 2.2+r()*1.6, 0x9a9aaa, 0.30).setDepth(3.2);
      this.smoke.push({ obj:dot, sx, sy, phase:r(), phX:r()*Math.PI*2, drift:2.5+r()*3 });
    }
  }

  /* -------- Kawanan burung melintas -------- */
  makeBirds(){
    if (!this.textures.exists('bird_sil')){
      const bg = this.add.graphics();
      bg.lineStyle(1.8, C.ink, 0.70);
      bg.lineBetween(0, 6, 6, 2);
      bg.lineBetween(6, 2, 8, 5);
      bg.lineBetween(8, 5, 10, 2);
      bg.lineBetween(10, 2, 16, 6);
      bg.generateTexture('bird_sil', 16, 8);
      bg.destroy();
    }
    const r = rng(33);
    // Formasi V longgar: 8 burung dengan offset berbasis posisi V
    const V_OFF = [
      [0, 0], [-14, 7], [14, 7], [-28, 14], [28, 14],
      [-20, 22], [20, 22], [0, 28],
    ];
    for (let i = 0; i < 8; i++){
      const sc = 0.72 + r() * 0.38;
      const img = this.add.image(0, 0, 'bird_sil')
        .setOrigin(0.5).setDepth(5.8).setAlpha(0.55 + r()*0.2).setScale(sc);
      this.birds.push({
        obj:   img,
        xOff:  V_OFF[i][0] + (r()-0.5)*6,
        baseY: 22 + r()*28 + V_OFF[i][1],
        ph:    r()*Math.PI*2,
        flapPh: r()*Math.PI*2,
        flapSp: 0.0072 + r()*0.003,
      });
    }
  }

  /* -------- Lingkaran riak air -------- */
  makeRipples(){
    const r = rng(99);
    // 6 titik tersebar di batas air atas dan bawah
    const POS = [
      [100,20],[380,20],[700,20],
      [100,540],[380,540],[700,540],
    ];
    for (const [sx,sy] of POS){
      const g = this.add.graphics().setDepth(1.3);
      this.ripples.push({ g, sx, sy, phase:r() });
    }
  }

  /* -------- Tekstur sprite unik per warga (7 karakter berbeda) -------- */
  makeNamedNpcTextures(){
    if (this.textures.exists('npc_darmo')) return;
    const DEFS = [
      { key:'npc_darmo',  outfit:0x5c6e38, pants:0x4a4a5a, hat:'white',    hairC:0xd0c8b8, hatC:0xd0c8b8, skinC:C.skin   },
      { key:'npc_siti',   outfit:0xb03268, pants:0x4a3060, hat:'headscarf', hairC:C.hair,   hatC:0x8a1848, skinC:C.skin   },
      { key:'npc_dodi',   outfit:0x2a7acc, pants:0x1a4488, hat:'none',      hairC:C.hair,   hatC:C.hair,   skinC:C.skin   },
      { key:'npc_ratna',  outfit:0x2a8860, pants:0x3a5040, hat:'flower',    hairC:0x3a2010, hatC:0x3a2010, skinC:C.skin   },
      { key:'npc_hasan',  outfit:0x1a3a70, pants:0x2a3a58, hat:'conical',   hairC:C.hair,   hatC:0xc0a040, skinC:0xc08060 },
      { key:'npc_lastri', outfit:0x6a3090, pants:0x3a2060, hat:'bun',       hairC:0x2a1810, hatC:0x2a1810, skinC:C.skin, glasses:true },
      { key:'npc_rudi',   outfit:0xe07020, pants:0x1a3888, hat:'cap',       hairC:C.hair,   hatC:0x1a4499, skinC:C.skin   },
    ];
    for (const d of DEFS){
      const g = this.add.graphics({ x:0, y:0 });
      g.fillStyle(C.ink).fillRoundedRect(4,25,6,4,1).fillRoundedRect(11,25,6,4,1);
      g.fillStyle(C.woodDark).fillRect(4,25,5,3).fillRect(11,25,5,3);
      g.fillStyle(d.pants||C.pants).fillRect(5,17,4,9).fillRect(11,17,4,9);
      g.lineStyle(1,C.ink,1).strokeRect(5,17,4,9).strokeRect(11,17,4,9);
      g.fillStyle(C.woodDark,0.7).fillRect(4,18,12,2);
      g.fillStyle(C.gold,0.9).fillRect(9,17.5,2,3);
      g.fillStyle(d.outfit).fillRoundedRect(4,9,12,10,2);
      g.fillStyle(0xffffff,0.15).fillRect(4,9,12,3);
      g.lineStyle(1.5,C.ink,1).strokeRoundedRect(4,9,12,10,2);
      g.fillStyle(d.skinC).fillCircle(10,5.5,5.5);
      g.fillStyle(C.skinShade,0.30).fillCircle(11.5,7,3.5);
      g.lineStyle(1.5,C.ink,1).strokeCircle(10,5.5,5.5);
      // Rambut / topi per karakter
      if (d.hat === 'headscarf'){
        g.fillStyle(d.hatC,0.88).fillEllipse(10,3.5,14,11);
        g.fillStyle(d.hatC,0.72).fillRect(5,3,10,5);
        g.lineStyle(0.5,C.ink,0.28).strokeEllipse(10,3.5,14,11);
        g.fillStyle(0xffffff,0.12).fillEllipse(8,2,7,4);
      } else if (d.hat === 'white'){
        g.fillStyle(d.hairC).fillRoundedRect(4,1,12,7,3);
        g.fillStyle(0xe0dcd4,0.38).fillCircle(8.5,4,3.5);
        g.lineStyle(0.5,C.ink,0.14).lineBetween(5,4,15,4).lineBetween(6,6,14,6);
      } else if (d.hat === 'none'){
        g.fillStyle(d.hairC).fillRoundedRect(5,0,10,6,3);
        g.fillStyle(0x9e7e5a,0.28).fillCircle(8,3,3);
      } else if (d.hat === 'flower'){
        g.fillStyle(d.hairC).fillRoundedRect(4,0,12,7,3);
        g.fillStyle(0x7a5530,0.25).fillCircle(8.5,3,3.5);
        g.lineStyle(0.7,C.ink,0.65).strokeRoundedRect(4,0,12,7,3);
        g.fillStyle(0xff6888,0.92).fillCircle(14.5,1.5,2.2);
        g.fillStyle(0xffee99,1.0).fillCircle(14.5,1.5,1.1);
      } else if (d.hat === 'conical'){
        g.fillStyle(d.hairC).fillRoundedRect(5,4,10,5,2);
        g.fillStyle(d.hatC,0.82).fillTriangle(2,8,18,8,10,-3);
        g.fillStyle(d.hatC,0.62).fillRect(1,7,18,2);
        g.lineStyle(0.5,C.ink,0.30).strokeTriangle(2,8,18,8,10,-3);
        g.lineStyle(0.5,0x8a6020,0.20);
        for (let li=1;li<6;li++) g.lineBetween(2+li,8-li,18-li,8-li);
      } else if (d.hat === 'bun'){
        g.fillStyle(d.hairC).fillRoundedRect(4,2,12,6,3);
        g.fillStyle(d.hairC,0.9).fillCircle(10,1,4);
        g.lineStyle(0.5,C.ink,0.3).strokeCircle(10,1,4);
        g.lineStyle(0.5,C.ink,0.20).lineBetween(6,3,14,3);
        if (d.glasses){
          g.lineStyle(0.8,C.ink,0.82);
          g.strokeCircle(8,5.5,2).strokeCircle(12,5.5,2);
          g.lineBetween(10,5.5,10.2,5.5).lineBetween(6,5.5,5,5).lineBetween(14,5.5,15,5);
        }
      } else if (d.hat === 'cap'){
        g.fillStyle(d.hairC).fillRoundedRect(5,3,10,5,2);
        g.fillStyle(d.hatC).fillRoundedRect(3,0,14,6,2);
        g.fillStyle(d.hatC,0.82).fillRect(2,5.5,16,2.5);
        g.lineStyle(0.5,C.ink,0.35).strokeRoundedRect(3,0,14,6,2);
        g.fillStyle(0xffffff,0.15).fillRect(4,1,5,1.5);
      } else {
        g.fillStyle(d.hairC).fillRoundedRect(5,4,10,5,2);
        g.fillStyle(d.hatC).fillRoundedRect(4,-1,12,7,2);
        g.fillStyle(d.hatC).fillRoundedRect(3,5,14,2.5,1);
        g.lineStyle(1,C.ink,0.9).strokeRoundedRect(4,-1,12,7,2);
      }
      g.fillStyle(C.ink).fillRect(7.5,5,2,2).fillRect(11.5,5,2,2);
      g.fillStyle(0xffffff,0.7).fillRect(8,5,1,1).fillRect(12,5,1,1);
      g.generateTexture(d.key, 20, 30);
      g.destroy();
    }
  }

  /* -------- Warga desa yang berkeliaran -------- */
  makeNpcs(){
    this.makeNamedNpcTextures();
    const NPC_DATA = [
      { name:'Pak Darmo',  key:'npc_darmo',  sc:1.08, itype:'bob'  },
      { name:'Bu Siti',    key:'npc_siti',   sc:1.00, itype:'sway' },
      { name:'Dodi',       key:'npc_dodi',   sc:0.82, itype:'rock' },
      { name:'Ratna',      key:'npc_ratna',  sc:1.00, itype:'bob'  },
      { name:'Pak Hasan',  key:'npc_hasan',  sc:1.05, itype:'sway' },
      { name:'Bu Lastri',  key:'npc_lastri', sc:1.00, itype:'rock' },
      { name:'Rudi',       key:'npc_rudi',   sc:0.85, itype:'bob'  },
    ];
    const walkable = [];
    for (let y=1; y<ROWS-1; y++)
      for (let x=1; x<COLS-1; x++)
        if (+MAP[y][x] !== 2) walkable.push([x,y]);
    for (let i=0; i<NPC_DATA.length; i++){
      const d = NPC_DATA[i];
      const [sx,sy] = walkable[Math.floor(Math.random()*walkable.length)];
      const wx = sx*TILE+TILE/2, wy = sy*TILE+TILE/2;
      const shadow = this.add.ellipse(0, 9, 18, 7, C.shadow, 0.28);
      const sprite = this.add.image(0, 0, d.key).setOrigin(0.5, 0.88);
      const c = this.add.container(wx, wy, [shadow, sprite]).setDepth(2.5 + wy/(ROWS*TILE)*4).setScale(d.sc);
      if (d.itype === 'sway'){
        this.tweens.add({ targets:sprite, scaleX:{from:1,to:0.93}, duration:1100+i*90,  yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
        this.tweens.add({ targets:sprite, y:{from:0,to:-1.5},      duration:920+i*80,   yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
      } else if (d.itype === 'rock'){
        this.tweens.add({ targets:sprite, rotation:{from:-0.06,to:0.06}, duration:960+i*115, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
      } else {
        this.tweens.add({ targets:sprite, y:-2, duration:800+i*110, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
      }
      this.npcs.push({ container:c, sprite, tx:sx, ty:sy, name:d.name, moveAt:Math.random()*2500, bubble:null, bubbleFading:false });
    }
  }

  /* -------- Kunang-kunang berkelip di dekat pohon -------- */
  makeFireflies(){
    const r = rng(2024);
    const ANCHORS = [
      [2,1],[5,1],[12,1],[17,1],[1,3],[1,6],[1,9],[1,11],
      [18,3],[18,6],[18,9],[18,11],[2,11],[6,11],[13,11],[17,11],
    ];
    for (let i=0; i<9; i++){
      const [tx,ty] = ANCHORS[(r()*ANCHORS.length)|0];
      const bx = tx*TILE + TILE/2 + (r()-0.5)*TILE*1.6;
      const by = ty*TILE + TILE/2 + (r()-0.5)*TILE*1.2;
      const dot = this.add.arc(bx, by, 1.5+r()*0.8, 0, 360, false, 0xffee55, 0).setDepth(5.5);
      this.fireflies.push({ obj:dot, ox:bx, oy:by, sp:0.35+r()*0.55, ph:r()*Math.PI*2, aph:r()*Math.PI*2 });
    }
  }

  /* -------- Daun gugur ambien -------- */
  makeLeaves(){
    if (!this.textures.exists('lf')){
      const g = this.add.graphics();
      g.fillStyle(0x5aa653, 0.9).fillEllipse(6, 3, 12, 6);
      g.lineStyle(0.5, 0x3f7d3d, 0.5).lineBetween(1, 3, 11, 3);
      g.generateTexture('lf', 12, 6);
      g.destroy();
    }
    const W = COLS*TILE;
    this.add.particles(W/2, -8, 'lf', {
      x:{ min:0, max:W }, y:0,
      speedY:{ min:18, max:52 },
      speedX:{ min:-16, max:16 },
      lifespan:{ min:5500, max:9000 },
      scale:{ min:0.6, max:1.7 },
      rotate:{ min:0, max:360 },
      tint:[C.leaf, C.leafHi, 0xc6e04c, 0xffe08a, C.gold],
      alpha:{ start:0.58, end:0 },
      frequency:550, quantity:1,
    }).setDepth(4.8);
  }

  /* -------- Kupu-kupu ambien (4 ekor, terbang melayang di area rumput) -------- */
  makeButterflies(){
    if (!this.textures.exists('butterfly')){
      const bg = this.add.graphics();
      // Sayap kiri atas (oranye)
      bg.fillStyle(0xff8822, 0.90).fillEllipse(4, 5, 8, 7);
      // Sayap kiri bawah (oranye gelap)
      bg.fillStyle(0xe05510, 0.85).fillEllipse(3, 10, 5, 5);
      // Sayap kanan atas
      bg.fillStyle(0xff8822, 0.90).fillEllipse(12, 5, 8, 7);
      // Sayap kanan bawah
      bg.fillStyle(0xe05510, 0.85).fillEllipse(13, 10, 5, 5);
      // Garis vena sayap
      bg.lineStyle(0.5, 0x331100, 0.4);
      bg.lineBetween(4, 2, 8, 8); bg.lineBetween(12, 2, 8, 8);
      // Badan
      bg.fillStyle(0x331100, 0.9).fillRect(7.5, 2, 1.5, 10);
      bg.generateTexture('butterfly', 16, 14);
      bg.destroy();
    }
    const r = rng(7701);
    // Titik jangkar di area rumput (hindari air / bangunan)
    const ANCHORS = [
      [3,3],[7,4],[14,3],[4,9],[16,8],[8,10],[11,5],[3,7],
    ];
    for (let i=0; i<4; i++){
      const [ax, ay] = ANCHORS[i];
      const ox = ax*TILE + (r()-0.5)*TILE*0.8;
      const oy = ay*TILE + (r()-0.5)*TILE*0.8;
      const sc = 0.70 + r()*0.22;
      const img = this.add.image(ox, oy, 'butterfly')
        .setOrigin(0.5).setDepth(5).setAlpha(0.72 + r()*0.18).setScale(sc);
      this.butterflies.push({
        obj: img, ox, oy, sc,
        sp:   0.38 + r()*0.32,
        ph:   r()*Math.PI*2,
        flapPh: r()*Math.PI*2,
        flapSp: 0.009  + r()*0.005,
      });
    }
  }

  /* -------- Overlay cahaya direksinoal (matahari kanan atas) -------- */
  makeAtmosphere(){
    const w = COLS*TILE, h = ROWS*TILE, key = 'atmo2';
    if (!this.textures.exists(key)){
      const cv = this.textures.createCanvas(key, w, h);
      const ctx = cv.getContext();
      // Cahaya overhead dari atas (langit cerah)
      const gVert = ctx.createLinearGradient(0, 0, 0, h);
      gVert.addColorStop(0,   'rgba(245,235,200,0.10)');
      gVert.addColorStop(0.45,'rgba(245,235,200,0.02)');
      gVert.addColorStop(1,   'rgba(10,8,30,0.14)');
      ctx.fillStyle = gVert; ctx.fillRect(0, 0, w, h);
      // Cahaya matahari hangat dari kanan atas
      const gSun = ctx.createRadialGradient(w*0.88, h*0.06, 0, w*0.88, h*0.06, w*0.82);
      gSun.addColorStop(0,   'rgba(255,210,90,0.12)');
      gSun.addColorStop(0.5, 'rgba(255,190,70,0.04)');
      gSun.addColorStop(1,   'rgba(255,190,70,0)');
      ctx.fillStyle = gSun; ctx.fillRect(0, 0, w, h);
      // Bayangan sejuk dari kiri bawah
      const gCool = ctx.createRadialGradient(0, h, 0, 0, h, w*0.55);
      gCool.addColorStop(0,   'rgba(70,90,200,0.08)');
      gCool.addColorStop(1,   'rgba(70,90,200,0)');
      ctx.fillStyle = gCool; ctx.fillRect(0, 0, w, h);
      cv.refresh();
    }
    this.add.image(0, 0, key).setOrigin(0).setDepth(99.5);
    // Overlay untuk efek denyut cahaya ambient (bayangan awan melintas)
    const w2 = COLS*TILE, h2 = ROWS*TILE;
    this.ambientOverlay = this.add.rectangle(w2/2, h2/2, w2, h2, 0xfff8e0, 0).setDepth(99.45);
  }

  /* -------- Vignette tepi layar -------- */
  makeVignette(){
    const w = COLS*TILE, h = ROWS*TILE, key = 'vignette';
    if (!this.textures.exists(key)){
      const cv = this.textures.createCanvas(key, w, h);
      const ctx = cv.getContext();
      const grad = ctx.createRadialGradient(w/2, h/2, h*0.55, w/2, h/2, h*0.95);
      grad.addColorStop(0, 'rgba(20,16,28,0)');
      grad.addColorStop(1, 'rgba(20,16,28,0.26)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
      cv.refresh();
    }
    this.add.image(0, 0, key).setOrigin(0).setDepth(100);
  }

  scheduleChirp(){
    const delay = 7000 + Math.random() * 11000;
    this.time.delayedCall(delay, () => { Audio.play('chirp'); this.scheduleChirp(); });
  }

  makeInteractHint(){
    this.hintRingGfx = this.add.graphics().setDepth(3.9);
    this.hintText = this.add.text(0, 0, 'SPASI ▶', {
      fontFamily:"'Pixelify Sans','Trebuchet MS',sans-serif",
      fontSize:'9px', color:'#e0a52b',
      stroke:'#241d2e', strokeThickness:2,
    }).setOrigin(0.5).setDepth(99).setAlpha(0).setVisible(false);
  }

  bindInput(){
    this.input.keyboard.on('keydown', e => {
      if (this.locked) return;
      if (isDialogueOpen()){ if (e.code==='Space' || e.code==='Enter') advanceDialogue(); return; }
      if (this.moving) return;
      let nx = this.px, ny = this.py;
      if      (e.code==='ArrowLeft'  || e.code==='KeyA') nx--;
      else if (e.code==='ArrowRight' || e.code==='KeyD') nx++;
      else if (e.code==='ArrowUp'    || e.code==='KeyW') ny--;
      else if (e.code==='ArrowDown'  || e.code==='KeyS') ny++;
      else if (e.code==='Space'){ this.tryInteract(); return; }
      else return;
      this.moveTo(nx, ny);
    });
  }

  moveTo(nx, ny){
    if (nx<0 || ny<0 || nx>=COLS || ny>=ROWS) return;
    if (+MAP[ny][nx] === 2) return;
    const isBack = (ny < this.py && nx === this.px);
    if      (nx < this.px){ this.pBody.setFlipX(true);  this.pFacing = -1; }
    else if (nx > this.px){ this.pBody.setFlipX(false); this.pFacing =  1; }
    else { this.pBody.setFlipX(false); }
    // Jejak kaki + debu memudar di posisi lama
    const fpx = this.px*TILE+TILE/2, fpy = this.py*TILE+TILE/2+9;
    const oldTile = +MAP[this.py][this.px];
    const fp = this.add.ellipse(fpx, fpy, 7, 4, C.shadow, 0.22).setDepth(0.4);
    this.tweens.add({ targets:fp, alpha:0, duration:440, ease:'Quad.easeOut', onComplete:()=> fp.destroy() });
    // Partikel debu jejak kaki
    if (this.textures.exists('spark')){
      const dustCol = oldTile === 1 ? C.pathShade : C.grassHi;
      const dp = this.add.particles(fpx, fpy-4, 'spark', {
        speed:{ min:10, max:28 }, angle:{ min:220, max:320 },
        lifespan:190, scale:{ start:0.15, end:0 },
        tint:[dustCol, C.foam], quantity:3, emitting:false,
      }).setDepth(0.8);
      dp.explode(3, fpx, fpy-4);
      this.time.delayedCall(260, ()=> dp.destroy());
    }
    this.px = nx; this.py = ny;
    this.moving = true;
    Audio.play(+MAP[ny][nx] === 1 ? 'stepPath' : 'stepGrass');
    // Alternatif langkah kiri-kanan per langkah
    this.stepCount++;
    const stepEven = this.stepCount % 2 === 0;
    const walkTex = isBack ? (stepEven ? 'char_uL' : 'char_uR') : (stepEven ? 'char_wL' : 'char_wR');
    this.pBody.setTexture(walkTex);
    this.tweens.add({ targets:this.pShadow, scaleX:1.3, duration:65, yoyo:true });
    const idleTex = isBack ? 'char_u' : 'char_i';
    // Pre-squish anticipation (40ms) → move (110ms) → stretch → settle
    this.tweens.add({ targets:this.pBody, scaleY:0.82, scaleX:1.12, duration:40, ease:'Quad.easeIn',
      onComplete:()=>{
        this.tweens.add({
          targets:this.pc, x:nx*TILE+TILE/2, y:ny*TILE+TILE/2, duration:110, ease:'Quad.easeInOut',
          onComplete:()=>{
            this.moving = false; this.pBody?.setTexture(idleTex);
            this.tweens.add({ targets:this.pBody, scaleY:1.08, scaleX:1.0, duration:55, ease:'Quad.easeOut',
              onComplete:()=> this.tweens.add({ targets:this.pBody, scaleY:1, duration:40 }) });
          },
        });
      },
    });
  }

  unlock(){
    this.locked = false;
    if (S.playerName && this.pc){
      const nt = this.add.text(0, -28, S.playerName, {
        fontFamily:"'Pixelify Sans',sans-serif",
        fontSize:'9px', color:'#f4ecd8',
        stroke:'#241d2e', strokeThickness:2,
      }).setOrigin(0.5).setDepth(6.5);
      this.pc.add(nt);
    }
  }

  stepDir(dir){
    if (this.locked || this.moving || isDialogueOpen()) return;
    let nx = this.px, ny = this.py;
    if      (dir==='left')  nx--;
    else if (dir==='right') nx++;
    else if (dir==='up')    ny--;
    else if (dir==='down')  ny++;
    this.moveTo(nx, ny);
  }

  action(){
    if (this.locked) return;
    if (isDialogueOpen()) advanceDialogue();
    else this.tryInteract();
  }

  teleport(spotId){
    const s = SPOTS.find(x => x.id === spotId);
    if (!s) return Promise.resolve();
    this.px = s.x;
    this.py = Math.min(ROWS-1, s.y + 1);
    if (+MAP[this.py][this.px] === 2) this.py = s.y;
    const tx = this.px*TILE+TILE/2, ty = this.py*TILE+TILE/2;
    this.tweens.add({ targets:this.pc, x:tx, y:ty, duration:500, ease:'Quad.easeInOut' });
    return new Promise(res => setTimeout(() => { this.pc.setPosition(tx, ty); res(); }, 560));
  }

  updateMarker(){
    if (!this.ring) return;
    const q = questInfo();
    const t = SPOTS.find(s => s.id === q.target);
    if (t){
      const cx = t.x*TILE+TILE/2, cy = t.y*TILE+TILE/2;
      this.ring.setPosition(cx, cy).setVisible(true);
      this.arrow.setPosition(cx, cy-34).setVisible(true);
    } else { this.ring.setVisible(false); this.arrow.setVisible(false); }
  }

  tryInteract(){
    const near = SPOTS.find(s => Math.abs(s.x-this.px)<=1 && Math.abs(s.y-this.py)<=1);
    if (near){ Audio.play('talk'); interact(near.id); return; }
    const nearNpc = this.npcs.find(n => Math.abs(n.tx-this.px)<=1 && Math.abs(n.ty-this.py)<=1);
    if (nearNpc){ Audio.play('talk'); const tips = NPC_CHAR_TIPS[nearNpc.name] || NPC_TIPS; showDialogue(nearNpc.name, tips[Math.floor(Math.random()*tips.length)]); return; }
    showDialogue('Wanderer','Tidak ada siapa-siapa di sini. Dekati bangunan atau warga, lalu tekan Spasi.');
  }

  /* -------- Efek juice -------- */
  moneyFx(delta){
    if (!this.pc) return;
    const x = this.pc.x, y = this.pc.y - 24;
    if (delta > 0){
      floatText(this, x, y, '+Rp'+delta.toLocaleString('id-ID'), '#7fc96b');
      burst(this, x, y, C.gold, 16); Audio.play('coin'); shake(this, 0.004, 100);
    } else if (delta < 0){
      floatText(this, x, y, '-Rp'+(-delta).toLocaleString('id-ID'), '#d96c6c');
      flash(this, 0xdd3333, 0.22);
      shake(this, 0.006, 180);
      burst(this, x, y+10, 0xaa2222, 7);
      Audio.play('pay');
    }
  }

  celebrate(){
    confetti(this, this.pc.x, this.pc.y - 20);
    flash(this, 0xffdd66, 0.38); shake(this, 0.01, 220);
    this.time.delayedCall(600,  ()=> confetti(this, this.pc.x - 80, this.pc.y - 20));
    this.time.delayedCall(1200, ()=> confetti(this, this.pc.x + 80, this.pc.y - 20));
    this.time.delayedCall(400,  ()=> flash(this, 0xffffff, 0.25));
    this.time.delayedCall(900,  ()=> flash(this, 0xffffff, 0.18));
    Audio.play('fanfare');
    this.locked = true;
    this.time.delayedCall(4000, ()=>{ this.locked = false; });
    const gameEl = document.getElementById('game');
    if (gameEl){ gameEl.classList.remove('win-glow'); requestAnimationFrame(()=> gameEl.classList.add('win-glow')); }
  }

  stageBanner(text){
    if (!text) return;
    const w = COLS*TILE, cy = ROWS*TILE * 0.34 + 8;
    const bar  = this.add.rectangle(-w, cy, w, 48, C.ink, 0.92).setDepth(99.8);
    const lTop = this.add.rectangle(-w, cy-23, w, 2, C.gold, 0.5).setDepth(99.85);
    const lBot = this.add.rectangle(-w, cy+23, w, 2, C.gold, 0.5).setDepth(99.85);
    const txt  = this.add.text(-w, cy, text, {
      fontFamily:"'Jersey 10',cursive", fontSize:'22px',
      color:'#e0a52b', stroke:'#14101c', strokeThickness:3,
    }).setOrigin(0.5).setDepth(99.9);
    const all = [bar, lTop, lBot, txt];
    // Horizontal wipe entrance from left
    this.tweens.add({ targets:all, x:w/2, duration:380, ease:'Back.easeOut',
      onComplete:()=>{
        flash(this, 0xffdd66, 0.18); shake(this, 0.005, 120);
        this.time.delayedCall(2200, ()=>
          this.tweens.add({ targets:all, alpha:0, duration:360,
            onComplete:()=> all.forEach(o => o.destroy()) }));
      }
    });
    this.tweens.add({ targets:txt, scaleX:{from:0.6,to:1.0}, scaleY:{from:0.6,to:1.0}, duration:380, ease:'Back.easeOut' });
  }

  update(time){
    // Denyut cahaya ambient (bayangan awan pelan, ≈12 dtk periode)
    if (this.ambientOverlay)
      this.ambientOverlay.setAlpha(Math.max(0, Math.sin(time * 0.00052) * 0.028));
    // Kilatan air bergeser perlahan
    if (this.waterShimmer)
      this.waterShimmer.setAlpha(0.55 + Math.sin(time * 0.00038) * 0.45);
    // Air beranimasi
    for (const w of this.waterTiles){
      const t = (Math.sin(time*0.002 + w._phase) + 1) / 2;
      w.fillColor = lerpC(C.water, C.waterHi, t*0.6);
    }
    // Pollen melayang
    for (const p of this.pollen){
      p.obj.x = p.ox + Math.sin(time * p.sp * 0.001 + p.ph) * 18;
      p.obj.y = p.oy + Math.cos(time * p.sp * 0.0007 + p.ph) * 12;
      p.ox += 0.04;
      if (p.ox > COLS*TILE + 20) p.ox = -20;
    }
    // Bayangan awan bergerak
    for (const cloud of this.clouds){
      cloud.obj.x += cloud.speed;
      if (cloud.obj.x > COLS*TILE + 120) cloud.obj.x = -120;
    }
    // Kawanan burung melintas (kanan ke kiri, ulang tiap ~19 dtk) — formasi V + kepak sayap
    const birdX = (time * 0.046) % (COLS*TILE + 120) - 60;
    for (const b of this.birds){
      b.obj.x = birdX + b.xOff;
      b.obj.y = b.baseY + Math.sin(time * 0.0009 + b.ph) * 4;
      const flap = 1.0 - Math.abs(Math.sin(time * b.flapSp + b.flapPh)) * 0.5;
      b.obj.setScale(b.obj.scaleX, flap * b.obj.scaleX);
    }
    // Asap cerobong — mengembang dan memudar saat naik
    for (const s of this.smoke){
      const age = (time * 0.00042 + s.phase) % 1;
      s.obj.x = s.sx + Math.sin(age * 7 + s.phX) * s.drift;
      s.obj.y = s.sy - age * 30;
      s.obj.setAlpha((1 - age) * 0.42);
      s.obj.setScale(0.55 + age * 2.4);
    }
    // Cahaya jendela berkedip (simulasi lilin / orang lewat)
    for (const wg of this.windowGlows){
      wg.obj.setAlpha(wg.base + Math.sin(time * wg.rate + wg.phase) * wg.amp);
    }
    // Kupu-kupu melayang
    for (const bf of this.butterflies){
      bf.obj.x = bf.ox + Math.sin(time * bf.sp * 0.0006 + bf.ph) * 28
               + Math.sin(time * bf.sp * 0.0014 + bf.ph * 0.7) * 10;
      bf.obj.y = bf.oy + Math.cos(time * bf.sp * 0.0004 + bf.ph) * 14
               + Math.cos(time * bf.sp * 0.0011 + bf.ph * 1.3) * 6;
      const fw = 0.22 + Math.abs(Math.sin(time * bf.flapSp + bf.flapPh)) * 0.78;
      bf.obj.setScale(fw * bf.sc, bf.sc);
    }
    // Warga desa bergerak
    for (const npc of this.npcs){
      if (time > npc.moveAt){
        const DIRS = [[-1,0],[1,0],[0,-1],[0,1]];
        const [dx,dy] = DIRS[Math.floor(Math.random()*4)];
        const nx = npc.tx+dx, ny = npc.ty+dy;
        if (nx>=1 && ny>=1 && nx<COLS-1 && ny<ROWS-1 && +MAP[ny][nx]!==2){
          npc.tx = nx; npc.ty = ny;
          const wx = nx*TILE+TILE/2, wy = ny*TILE+TILE/2;
          if (dx < 0) npc.sprite.setFlipX(true);
          else if (dx > 0) npc.sprite.setFlipX(false);
          this.tweens.add({ targets:npc.container, x:wx, y:wy, duration:550, ease:'Linear' });
          // Pantul langkah: squish-stretch scaleY saat berjalan
          this.tweens.killTweensOf(npc.sprite);
          this.tweens.add({ targets:npc.sprite, scaleY:{from:0.90, to:1.04}, duration:138, yoyo:true, repeat:1, ease:'Quad.easeOut',
            onComplete:()=> this.tweens.add({ targets:npc.sprite, scaleY:1, duration:80 }) });
        }
        npc.moveAt = time + 1600 + Math.random()*2200;
      }
      npc.container.setDepth(2.5 + npc.container.y / (ROWS*TILE) * 4);
    }
    // Kedalaman pemain mengikuti posisi Y (depth sorting perspektif atas)
    if (this.pc) this.pc.setDepth(2.5 + this.pc.y / (ROWS*TILE) * 4);
    // Obor berkedip
    for (const t of this.torches){
      const v = (Math.sin(time * 0.0038 + t.phase) + 1) / 2;
      t.glow.clear();
      t.glow.fillStyle(C.gold, 0.07 + v*0.07);
      t.glow.fillCircle(t.sx, t.sy, 12 + v*5);
      t.glow.fillStyle(0xff8822, 0.10 + v*0.08);
      t.glow.fillCircle(t.sx, t.sy, 6 + v*3);
      t.flame.clear();
      t.flame.fillStyle(0xff6611, 0.9).fillTriangle(t.sx-2, t.sy+1, t.sx+2, t.sy+1, t.sx, t.sy-5);
      t.flame.fillStyle(0xffee55, 0.85).fillTriangle(t.sx-1, t.sy+1, t.sx+1, t.sy+1, t.sx, t.sy-(3+v*2));
      t.flame.fillStyle(0xff3300, 0.8).fillCircle(t.sx, t.sy+1, 2);
    }
    // Cahaya hangat obor pada karakter (tint dinamis)
    if (this.pBody && this.torches.length){
      let closest = 999;
      for (const t of this.torches){
        const dx = this.pc.x - t.sx, dy = this.pc.y - t.sy;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < closest) closest = d;
      }
      if (closest < 80){
        const w = Math.max(0, 1 - closest / 80);
        const gv = Math.round(255 - w * 55);
        const b2 = Math.round(255 - w * 138);
        this.pBody.setTint((0xff << 16) | (gv << 8) | b2);
      } else {
        this.pBody.clearTint();
      }
    }
    // Riak lingkaran di atas air
    for (const rip of this.ripples){
      const t = (time * 0.00024 + rip.phase) % 1;
      rip.g.clear();
      rip.g.lineStyle(1, C.waterHi, (1 - t) * 0.38);
      rip.g.strokeCircle(rip.sx, rip.sy, 3 + t * 14);
    }
    // Kunang-kunang berkelip
    for (const ff of this.fireflies){
      ff.obj.x = ff.ox + Math.sin(time * ff.sp * 0.0006 + ff.ph) * 14;
      ff.obj.y = ff.oy + Math.cos(time * ff.sp * 0.0004 + ff.ph * 1.3) * 10;
      ff.obj.setAlpha(((Math.sin(time * 0.0022 + ff.aph) + 1) / 2) * 0.60);
    }
    // Gelembung pendekatan NPC ("...")
    if (!this.locked){
      for (const npc of this.npcs){
        const near = Math.abs(npc.tx-this.px)<=1 && Math.abs(npc.ty-this.py)<=1;
        const show = near && !isDialogueOpen();
        if (near) npc.sprite.setFlipX(this.px < npc.tx);
        if (show && !npc.bubble && !npc.bubbleFading){
          npc.bubble = this.add.text(0, -36, npc.name, {
            fontFamily:"'Pixelify Sans',sans-serif",
            fontSize:'9px', color:'#f4ecd8',
            stroke:'#241d2e', strokeThickness:2,
            backgroundColor:'rgba(36,29,46,0.78)',
            padding:{ x:5, y:2 }
          }).setOrigin(0.5).setDepth(6.8).setAlpha(0).setScale(0.5);
          npc.container.add(npc.bubble);
          this.tweens.add({ targets:npc.bubble, alpha:1, y:-42, scale:1.0, duration:240, ease:'Back.easeOut' });
        } else if (!show && npc.bubble && !npc.bubbleFading){
          npc.bubbleFading = true;
          const b = npc.bubble;
          this.tweens.add({ targets:b, alpha:0, duration:180,
            onComplete:()=>{ npc.container.remove(b, true); npc.bubble=null; npc.bubbleFading=false; } });
        }
      }
    }
    // Indikator interaksi: cincin emas berdenyut + teks melayang
    if (this.hintRingGfx) this.hintRingGfx.clear();
    if (!isDialogueOpen() && !this.locked && this.hintRingGfx){
      const nearSpot = SPOTS.find(s => Math.abs(s.x-this.px)<=1 && Math.abs(s.y-this.py)<=1);
      if (nearSpot){
        const hx = nearSpot.x*TILE+TILE/2, hy = nearSpot.y*TILE+TILE/2;
        const pulse = (Math.sin(time * 0.004) + 1) / 2;
        this.hintRingGfx.lineStyle(2, C.gold, 0.25 + pulse * 0.40);
        this.hintRingGfx.strokeEllipse(hx, hy+6, 52, 16);
        this.hintRingGfx.lineStyle(1, C.gold, 0.08 + pulse * 0.16);
        this.hintRingGfx.strokeEllipse(hx, hy+6, 62, 22);
        this.hintRingGfx.lineStyle(1, 0xffffff, 0.05 + pulse * 0.12);
        this.hintRingGfx.strokeEllipse(hx, hy+6, 20, 10);
        if (!this.hintShowing){
          this.hintShowing = true;
          this.hintText.setVisible(true);
          this.tweens.killTweensOf(this.hintText);
          this.tweens.add({ targets:this.hintText, alpha:1, duration:250 });
        }
        this.hintText.setPosition(hx, hy - 32 + Math.sin(time * 0.003) * 3);
      } else {
        if (this.hintShowing){
          this.hintShowing = false;
          this.tweens.killTweensOf(this.hintText);
          this.tweens.add({ targets:this.hintText, alpha:0, duration:180,
            onComplete:()=>{ if (this.hintText) this.hintText.setVisible(false); } });
        }
      }
    } else if (this.hintShowing){
      this.hintShowing = false;
      if (this.hintText) this.hintText.setAlpha(0).setVisible(false);
    }
  }
}
