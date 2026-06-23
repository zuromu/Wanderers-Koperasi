/**
 * scene.js, Scene Phaser dunia desa.
 * Semua grafik digambar prosedural: tanah, air, bangunan pixel-art bergaris tinta,
 * karakter beranimasi, pollen melayang, dan bayangan awan bergerak.
 */

import { TILE, COLS, ROWS, MAP, SPOTS } from './data.js';
import { questInfo } from './state.js';
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

export class Village extends Phaser.Scene {
  constructor(){ super('Village'); }

  create(){
    setSceneRef(this);
    ensureSpark(this);
    this.waterTiles = [];
    this.pollen     = [];
    this.smoke      = [];
    this.birds      = [];
    this.locked     = true;

    this.drawGround();
    this.drawWater();
    this.drawWaterFoam();
    this.drawTrees();
    this.makeCloudShadow();
    this.drawBuildings();
    this.makeMarker();
    this.makePlayer();
    this.makePollen();
    this.makeSmoke();
    this.makeBirds();
    this.makeVignette();
    this.bindInput();

    this.cameras.main.fadeIn(450, 8, 6, 12);
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
        g.fillStyle(lerpC(base, shade, r()*0.3), 1).fillRect(x*TILE, y*TILE, TILE, TILE);
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
      // Bayangan pohon
      g.fillStyle(C.shadow, 0.11).fillEllipse(cx, cy+13, 26*s, 9*s);
      // Batang
      g.fillStyle(C.woodDark).fillRect(cx-2.5*s, cy+2, 5*s, 13);
      g.lineStyle(1, C.ink, 0.75).strokeRect(cx-2.5*s, cy+2, 5*s, 13);
      // Daun bawah
      g.fillStyle(C.leaf).fillCircle(cx, cy-4, 11*s);
      g.lineStyle(1.5, C.ink, 0.55).strokeCircle(cx, cy-4, 11*s);
      // Sisi gelap daun
      g.fillStyle(C.leafDark, 0.38).fillCircle(cx+2*s, cy+1, 6*s);
      // Daun atas (lebih terang)
      g.fillStyle(C.leafHi, 0.8).fillCircle(cx-1, cy-10*s, 7*s);
      // Kilatan cahaya
      g.fillStyle(0xffffff, 0.09).fillCircle(cx-3*s, cy-12*s, 3*s);
    });
  }

  /* -------- Bayangan awan bergerak -------- */
  makeCloudShadow(){
    this.cloudShadow = this.add.ellipse(-90, ROWS*TILE*0.28, 200, 65, C.shadow, 0.07).setDepth(1.5);
  }

  /* -------- Bangunan prosedural (gaya pixel-art bergaris tinta) -------- */
  drawBuildings(){
    const g = this.add.graphics().setDepth(3);
    SPOTS.forEach(s => {
      const cx = s.x*TILE + TILE/2;
      const cy = s.y*TILE + TILE/2;
      g.fillStyle(C.shadow, 0.18).fillEllipse(cx, cy+15, 38, 11);
      switch(s.id){
        case 'kepala':    this._drawCottage(g, cx, cy);   break;
        case 'koperasi':  this._drawKoperasi(g, cx, cy);  break;
        case 'bendahara': this._drawTreasury(g, cx, cy);  break;
        case 'ladang':    this._drawField(g, cx, cy);     break;
        case 'pasar':     this._drawMarket(g, cx, cy);    break;
        case 'balai':     this._drawHall(g, cx, cy);      break;
      }
      this.add.text(cx, cy+19, s.name, {
        fontFamily:"'Pixelify Sans', 'Trebuchet MS', sans-serif",
        fontSize:'8px', fontStyle:'bold',
        color:'#241d2e', backgroundColor:'#e0a52b',
        padding:{ x:4, y:2 },
      }).setOrigin(.5).setDepth(4).setAlpha(.95);
      if (s.id === 'koperasi'){
        this.add.rectangle(cx, cy-30, 2, 18, C.ink).setDepth(3.8).setOrigin(0.5, 1);
        const flag = this.add.rectangle(cx, cy-43, 13, 8, C.roofRed).setDepth(3.8).setOrigin(0, 0.5);
        this.tweens.add({ targets:flag, scaleX:{ from:1, to:0.65 }, duration:680, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
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
    // Jendela
    g.fillStyle(C.waterHi, 0.75).fillRect(cx-10, cy-12, 5, 5);
    g.lineStyle(1, C.ink, 1).strokeRect(cx-10, cy-12, 5, 5);
    g.lineStyle(1, C.ink, 0.5).lineBetween(cx-7.5, cy-12, cx-7.5, cy-7);
    g.lineBetween(cx-10, cy-9.5, cx-5, cy-9.5);
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
    g.lineStyle(2, C.ink, 1);
    g.strokePoints([{x:cx-16,y:cy-20},{x:cx+16,y:cy-20},{x:cx,y:cy-30}], true);
    // Pintu masuk
    g.fillStyle(C.shadow, 0.45).fillRoundedRect(cx-4, cy-7, 8, 15, 1);
  }

  _drawTreasury(g, cx, cy){
    // Badan peti
    g.fillStyle(C.wood).fillRoundedRect(cx-12, cy-4, 24, 17, 3);
    g.lineStyle(2, C.ink, 1).strokeRoundedRect(cx-12, cy-4, 24, 17, 3);
    g.fillStyle(0xd4a870, 0.4).fillRect(cx-11, cy-3, 22, 4);
    // Tutup peti (lebih gelap)
    g.fillStyle(C.woodDark).fillRoundedRect(cx-13, cy-11, 26, 9, 3);
    g.lineStyle(2, C.ink, 1).strokeRoundedRect(cx-13, cy-11, 26, 9, 3);
    g.fillStyle(0x9e6e3c, 0.35).fillRect(cx-12, cy-10, 24, 2);
    // Pita emas di sambungan
    g.fillStyle(C.gold, 0.8).fillRect(cx-12, cy-4, 24, 2);
    // Gembok emas
    g.fillStyle(C.gold).fillCircle(cx, cy-6, 4);
    g.lineStyle(2, C.goldDark, 1).strokeCircle(cx, cy-6, 4);
    g.fillStyle(C.goldDark).fillRect(cx-1.5, cy-5, 3, 4);
    // Baut sudut
    g.fillStyle(C.gold);
    [[-9,-7],[9,-7],[-9,9],[9,9]].forEach(([bx,by]) => g.fillCircle(cx+bx, cy+by, 2.5));
  }

  _drawField(g, cx, cy){
    // 3 petak tanah subur
    for (let row=0; row<3; row++){
      const ry = cy - 10 + row*8;
      const sc = row === 1 ? C.path : C.pathShade;
      g.fillStyle(sc).fillRoundedRect(cx-13, ry, 26, 6, 1);
      g.lineStyle(1, C.ink, 0.25).strokeRoundedRect(cx-13, ry, 26, 6, 1);
      // Tanaman per petak
      g.fillStyle(C.leaf);
      for (let i=0; i<4; i++) g.fillCircle(cx-10+i*7, ry+2, 2.5);
      g.fillStyle(C.leafHi, 0.5);
      for (let i=0; i<4; i++) g.fillCircle(cx-10.5+i*7, ry+1, 1);
    }
    // Pagar kayu kanan
    g.fillStyle(C.wood).fillRect(cx+12, cy-12, 3, 26);
    g.lineStyle(1.5, C.ink, 1).strokeRect(cx+12, cy-12, 3, 26);
    g.lineStyle(1, C.woodDark, 0.6).lineBetween(cx-13, cy-6, cx+12, cy-6);
    g.lineBetween(cx-13, cy+2, cx+12, cy+2);
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
    g.lineStyle(2, C.ink, 1);
    g.strokePoints([{x:cx-15,y:cy-2},{x:cx+15,y:cy-2},{x:cx,y:cy-15}], true);
    g.fillStyle(0x6cc4c4, 0.35).fillTriangle(cx-13, cy-2, cx+13, cy-2, cx, cy-13);
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
    g.lineStyle(2, C.ink, 1);
    g.strokePoints([{x:cx-17,y:cy-22},{x:cx+17,y:cy-22},{x:cx,y:cy-34}], true);
    // Pintu
    g.fillStyle(C.shadow, 0.4).fillRoundedRect(cx-5, cy-8, 10, 18, 1);
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

    const c = this.add.container(this.px*TILE+TILE/2, this.py*TILE+TILE/2).setDepth(6);
    this.pShadow = this.add.ellipse(0, 12, 26, 10, C.shadow, 0.35);
    this.pBody   = this.add.image(0, 0, 'char_i').setOrigin(0.5, 0.75);
    c.add([this.pShadow, this.pBody]);
    this.pc = c;
    this.moving = false;
    // Bob idle
    this.tweens.add({ targets:this.pBody, y:-3, duration:900, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    this.updateMarker();
  }

  _makeCharTextures(){
    if (this.textures.exists('char_i')) return;
    ['char_i', 'char_w'].forEach((key, fi) => {
      const g = this.add.graphics({ x:0, y:0 });
      const walk = fi === 1;
      const ll = walk ? 6 : 8,  rl = walk ? 17 : 15; // posisi kaki
      const ls = walk ? 5 : 7,  rs = walk ? 16 : 14; // posisi sepatu

      // Sepatu
      g.fillStyle(C.woodDark);
      g.fillRect(ls, 37, 7, 4);
      g.fillRect(rs, 37, 7, 4);

      // Kaki (celana)
      g.fillStyle(C.pants);
      g.fillRect(ll, 27, 5, 11);
      g.fillRect(rl, 27, 5, 11);
      g.lineStyle(1.5, C.ink, 1);
      g.strokeRect(ll, 27, 5, 11);
      g.strokeRect(rl, 27, 5, 11);

      // Badan (tunik)
      g.fillStyle(C.tunic);
      g.fillRoundedRect(7, 16, 14, 13, 2);
      g.fillStyle(C.tunicHi, 0.45);
      g.fillRect(8, 17, 12, 3);
      g.lineStyle(1.5, C.ink, 1);
      g.strokeRoundedRect(7, 16, 14, 13, 2);

      // Lengan
      g.fillStyle(C.tunic);
      g.fillRoundedRect(3, 17, 5, 9, 1);
      g.fillRoundedRect(20, 17, 5, 9, 1);
      g.lineStyle(1.5, C.ink, 1);
      g.strokeRoundedRect(3, 17, 5, 9, 1);
      g.strokeRoundedRect(20, 17, 5, 9, 1);

      // Leher
      g.fillStyle(C.skin);
      g.fillRect(11, 14, 6, 4);

      // Kepala
      g.fillStyle(C.skin);
      g.fillCircle(14, 9, 8);
      g.lineStyle(2, C.ink, 1);
      g.strokeCircle(14, 9, 8);

      // Rambut
      g.fillStyle(C.hair);
      g.fillRoundedRect(6, 1, 16, 9, 4);

      // Mata
      g.fillStyle(C.ink);
      g.fillRect(11, 8, 2, 2);
      g.fillRect(16, 8, 2, 2);

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

  /* -------- Asap cerobong beranimasi -------- */
  makeSmoke(){
    const kepala = SPOTS.find(s => s.id === 'kepala');
    if (!kepala) return;
    const sx = kepala.x * TILE + TILE/2 + 7;
    const sy = kepala.y * TILE + TILE/2 - 26;
    const r = rng(55);
    for (let i = 0; i < 5; i++){
      const dot = this.add.circle(sx, sy, 1.8+r()*1.4, 0x9a9aaa, 0.35).setDepth(3.2);
      this.smoke.push({ obj:dot, sx, sy, phase:r(), phX:r()*Math.PI*2, drift:2+r()*3 });
    }
  }

  /* -------- Kawanan burung melintas -------- */
  makeBirds(){
    const r = rng(33);
    for (let i = 0; i < 5; i++){
      const dot = this.add.circle(0, 0, 1.5+r()*0.5, C.ink, 0.5).setDepth(5.8);
      this.birds.push({ obj:dot, xOff:(r()-0.5)*22, baseY:18+r()*34, ph:r()*Math.PI*2 });
    }
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

  bindInput(){
    this.input.keyboard.on('keydown', e => {
      if (this.locked) return;
      if (isDialogueOpen()){ if (e.code === 'Space') advanceDialogue(); return; }
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
    if (nx < this.px) this.pBody.setFlipX(true);
    else if (nx > this.px) this.pBody.setFlipX(false);
    this.px = nx; this.py = ny;
    this.moving = true;
    Audio.play('move');
    this.pBody.setTexture('char_w');
    this.tweens.add({ targets:this.pBody,   scaleX:1.18, scaleY:0.82, duration:70, yoyo:true, ease:'Quad.easeOut' });
    this.tweens.add({ targets:this.pShadow, scaleX:1.3,  duration:70, yoyo:true });
    this.tweens.add({
      targets:this.pc, x:nx*TILE+TILE/2, y:ny*TILE+TILE/2, duration:130, ease:'Quad.easeInOut',
      onComplete:()=>{ this.moving = false; this.pBody?.setTexture('char_i'); },
    });
  }

  unlock(){ this.locked = false; }

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
    if (near){ Audio.play('talk'); interact(near.id); }
    else showDialogue('Wanderer','Tidak ada siapa-siapa di sini. Dekati bangunan bertanda lalu tekan Spasi.');
  }

  /* -------- Efek juice -------- */
  moneyFx(delta){
    if (!this.pc) return;
    const x = this.pc.x, y = this.pc.y - 24;
    if (delta > 0){
      floatText(this, x, y, '+Rp'+delta.toLocaleString('id-ID'), '#7fc96b');
      burst(this, x, y, C.gold, 16); Audio.play('coin'); shake(this, 0.004, 100);
    } else if (delta < 0){
      floatText(this, x, y, 'Rp'+delta.toLocaleString('id-ID'), '#d96c6c');
      Audio.play('pay');
    }
  }

  celebrate(){
    confetti(this, this.pc.x, this.pc.y - 20);
    flash(this, 0xffffff, 0.4); shake(this, 0.01, 220); Audio.play('fanfare');
  }

  update(time){
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
    this.cloudShadow.x += 0.18;
    if (this.cloudShadow.x > COLS*TILE + 90) this.cloudShadow.x = -90;
    // Kawanan burung melintas (kanan ke kiri, ulang tiap ~19 dtk)
    const birdX = (time * 0.046) % (COLS*TILE + 120) - 60;
    for (const b of this.birds){
      b.obj.x = birdX + b.xOff;
      b.obj.y = b.baseY + Math.sin(time * 0.0009 + b.ph) * 4;
    }
    // Asap cerobong
    for (const s of this.smoke){
      const age = (time * 0.00042 + s.phase) % 1;
      s.obj.x = s.sx + Math.sin(age * 7 + s.phX) * s.drift;
      s.obj.y = s.sy - age * 28;
      s.obj.setAlpha((1 - age) * 0.45);
    }
  }
}
