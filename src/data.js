/**
 * data.js, Data dunia game (peta, lokasi, konstanta).
 * Tidak ada logika di sini, hanya data murni agar mudah diubah & ditambah.
 */

export const TILE = 40;
export const COLS = 20, ROWS = 14;
export const W = COLS * TILE, H = ROWS * TILE;

/** Format angka ke Rupiah Indonesia, mis. 50000 -> "Rp50.000" */
export const rupiah = n => 'Rp' + n.toLocaleString('id-ID');

/**
 * Peta desa. Setiap karakter = satu petak (tile):
 *   0 = rumput (bisa dilewati)
 *   1 = jalan  (bisa dilewati)
 *   2 = air/penghalang (tidak bisa dilewati)
 */
export const MAP = [
  "22222222222222222222",
  "20000000110000000002",
  "20011111110111111002",
  "20010000010100001002",
  "20010000010100001002",
  "21111111111111111112",
  "20010000010100001002",
  "20010000010100001002",
  "20011111110111111002",
  "20000000110000000002",
  "21111111111111111112",
  "20000000000000000002",
  "20000000000000000002",
  "22222222222222222222",
];

/**
 * Bangunan / NPC yang bisa diajak berinteraksi (koordinat dalam petak grid).
 * id dipakai oleh state machine untuk menentukan dialog & efeknya.
 */
export const SPOTS = [
  { id:'kepala',    x:3,  y:2,  name:'Kepala Desa' },
  { id:'koperasi',  x:10, y:2,  name:'Kantor Koperasi' },
  { id:'bendahara', x:16, y:4,  name:'Bendahara' },
  { id:'ladang',    x:3,  y:7,  name:'Ladang' },
  { id:'pasar',     x:16, y:7,  name:'Pasar' },
  { id:'balai',     x:10, y:12, name:'Balai Desa (RAT)' },
  { id:'well',      x:10, y:11, name:'Sumur Desa', deco:true },
];
