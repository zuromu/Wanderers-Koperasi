/**
 * scene.js, Scene Phaser dunia desa.
 * Render bergaya "cozy" prosedural (tanpa aset): tanah bertekstur, air beranimasi,
 * kartu bangunan berbayang, pemain ber-container (bayangan + bob + squash),
 * vignette, penanda tujuan berdenyut, plus efek juice saat transaksi.
 */

import { TILE, COLS, ROWS, MAP, SPOTS } from './data.js';
import { questInfo } from './state.js';
import { interact } from './quest.js';
import { isDialogueOpen, advanceDialogue, refresh, setSceneRef, showDialogue } from './ui.js';
import { C } from './palette.js';
import { ensureSpark, floatText, burst, confetti, shake, flash } from './effects.js';
import * as Audio from './audio.js';

/* RNG deterministik agar tekstur stabil tiap muat. */
function rng(seed){
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a>>>15), 1|a);
    t = (t + Math.imul(t ^ (t>>>7), 61|t)) ^ t; return ((t ^ (t>>>14))>>>0) / 4294967296; };
}
const lerpC = (c1, c2, t) => {
  const o = Phaser.Display.Color.Interpolate.ColorWithColor(
    Phaser.Display.Color.IntegerToColor(c1),
    Phaser.Display.Color.IntegerToColor(c2), 100, t*100);
  return Phaser.Display.Color.GetColor(o.r, o.g, o.b);
};

export class Village extends Phaser.Scene {
  constructor(){ super('Village'); }

  create(){
    setSceneRef(this);
    ensureSpark(this);
    this.waterTiles = [];
    this.locked = true; // dibuka saat pemain menekan "Main"

    this.drawGround();
    this.drawWater();
    this.drawBuildings();
    this.makeMarker();
    this.makePlayer();
    this.makeVignette();
    this.bindInput();

    this.cameras.main.fadeIn(450, 8, 6, 12);
    refresh();
  }

  /* ---------- Tanah (rumput + jalan) dengan jitter & detail ---------- */
  drawGround(){
    const g = this.add.graphics().setDepth(0);
    const r = rng(1337);
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        const t = +MAP[y][x];
        if (t === 2) continue; // air digambar terpisah
        const base  = t === 1 ? C.path : C.grass;
        const shade = t === 1 ? C.pathShade : C.grassShade;
        const col = lerpC(base, shade, r()*0.3);
        g.fillStyle(col, 1).fillRect(x*TILE, y*TILE, TILE, TILE);
        // detail: bunga/kerikil/rumput
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

  /* ---------- Air beranimasi ---------- */
  drawWater(){
    for (let y=0; y<ROWS; y++){
      for (let x=0; x<COLS; x++){
        if (+MAP[y][x] !== 2) continue;
        const rect = this.add.rectangle(x*TILE+TILE/2, y*TILE+TILE/2, TILE, TILE, C.water)
          .setDepth(1);
        rect._phase = (x*0.7 + y*1.3);
        this.waterTiles.push(rect);
      }
    }
  }

  /* ---------- Kartu bangunan (bayangan + badan + banner nama) ---------- */
  drawBuildings(){
    SPOTS.forEach(s => {
      const cx = s.x*TILE + TILE/2, cy = s.y*TILE + TILE/2;
      const card = this.add.graphics().setDepth(3);
      card.fillStyle(C.shadow, .35).fillRoundedRect(cx-17, cy-13, 34, 36, 8);     // bayangan
      card.fillStyle(0xf7efdf, 1).fillRoundedRect(cx-17, cy-17, 34, 34, 8);        // badan
      card.lineStyle(2, C.shadow, .5).strokeRoundedRect(cx-17, cy-17, 34, 34, 8);
      this.add.text(cx, cy-2, s.emoji, { fontSize:'22px' }).setOrigin(.5).setDepth(4);
      // banner nama
      const label = this.add.text(cx, cy+24, s.name, {
        fontFamily:'Trebuchet MS, Verdana, sans-serif', fontSize:'9px',
        fontStyle:'bold', color:'#2a2030', backgroundColor:'#e8a33d',
        padding:{ x:4, y:2 },
      }).setOrigin(.5).setDepth(4);
      label.setAlpha(.95);
    });
  }

  /* ---------- Penanda tujuan: cincin berdenyut + panah memantul ---------- */
  makeMarker(){
    this.ring = this.add.circle(0, 0, 22, C.gold, 0.18).setDepth(2).setVisible(false);
    this.tweens.add({ targets:this.ring, scale:{ from:0.8, to:1.25 }, alpha:{ from:0.28, to:0.05 },
      duration:1000, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    this.arrow = this.add.text(0, 0, '▼', { fontSize:'18px', color:'#e8a33d',
      stroke:'#14101c', strokeThickness:3 }).setOrigin(.5).setDepth(7).setVisible(false);
    this.tweens.add({ targets:this.arrow, y:'+=6', duration:600, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
  }

  /* ---------- Pemain: container (bayangan + emoji), bob & squash ---------- */
  makePlayer(){
    this.px = 10; this.py = 11;
    const c = this.add.container(this.px*TILE+TILE/2, this.py*TILE+TILE/2).setDepth(6);
    this.pShadow = this.add.ellipse(0, 13, 24, 9, C.shadow, 0.3);
    this.pBody = this.add.text(0, 0, '🧍', { fontSize:'30px' }).setOrigin(.5);
    c.add([this.pShadow, this.pBody]);
    this.pc = c;
    this.moving = false;
    // bob idle (pada emoji, properti y, tak bentrok dengan gerak container)
    this.tweens.add({ targets:this.pBody, y:-4, duration:900, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    this.updateMarker();
  }

  /* ---------- Vignette ---------- */
  makeVignette(){
    const w = COLS*TILE, h = ROWS*TILE, key = 'vignette';
    if (!this.textures.exists(key)){
      const cv = this.textures.createCanvas(key, w, h);
      const cx = cv.getContext();
      const grad = cx.createRadialGradient(w/2, h/2, h*0.55, w/2, h/2, h*0.95);
      grad.addColorStop(0, 'rgba(20,16,28,0)');
      grad.addColorStop(1, 'rgba(20,16,28,0.26)');
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
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
    this.px = nx; this.py = ny;
    this.moving = true;
    Audio.play('move');
    // squash langkah
    this.tweens.add({ targets:this.pBody, scaleX:1.18, scaleY:0.82, duration:70, yoyo:true, ease:'Quad.easeOut' });
    this.tweens.add({ targets:this.pShadow, scaleX:1.3, duration:70, yoyo:true });
    this.tweens.add({
      targets:this.pc, x:nx*TILE+TILE/2, y:ny*TILE+TILE/2, duration:130, ease:'Quad.easeInOut',
      onComplete:()=>{ this.moving = false; },
    });
  }

  unlock(){ this.locked = false; }

  /** Satu langkah ke arah tertentu (dipakai tombol sentuh). */
  stepDir(dir){
    if (this.locked || this.moving || isDialogueOpen()) return;
    let nx = this.px, ny = this.py;
    if      (dir==='left')  nx--;
    else if (dir==='right') nx++;
    else if (dir==='up')    ny--;
    else if (dir==='down')  ny++;
    this.moveTo(nx, ny);
  }

  /** Tombol aksi sentuh: lanjut dialog atau berinteraksi. */
  action(){
    if (this.locked) return;
    if (isDialogueOpen()) advanceDialogue();
    else this.tryInteract();
  }

  /** Pindahkan pemain ke samping sebuah spot (untuk mode demo).
   *  Resolusi promise via timer (bukan onComplete tween) agar urutan demo tetap
   *  jalan walau loop animasi di-throttle; tween tetap memberi gerak halus. */
  teleport(spotId){
    const s = SPOTS.find(x => x.id === spotId);
    if (!s) return Promise.resolve();
    this.px = s.x;
    this.py = Math.min(ROWS-1, s.y + 1);
    if (+MAP[this.py][this.px] === 2) this.py = s.y; // hindari air
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
    else showDialogue('Wanderer','Tidak ada siapa-siapa di sini. Dekati gedung bertanda lalu tekan Spasi.');
  }

  /* ---------- API efek dipanggil dari UI/quest ---------- */
  moneyFx(delta){
    if (!this.pc) return;
    const x = this.pc.x, y = this.pc.y - 24;
    if (delta > 0){
      floatText(this, x, y, '+' + ('Rp'+delta.toLocaleString('id-ID')), '#7fc96b');
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
    for (const w of this.waterTiles){
      const t = (Math.sin(time*0.002 + w._phase) + 1) / 2;
      w.fillColor = lerpC(C.water, C.waterHi, t*0.6);
    }
  }
}
