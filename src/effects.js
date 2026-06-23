/**
 * effects.js, "Juice": teks mengambang, ledakan partikel, getar layar, kilat.
 * Semua fungsi menerima `scene` Phaser dan memakai tekstur 'spark' yang dibuat
 * sekali lewat ensureSpark().
 */
import { C } from './palette.js';

/** Buat tekstur partikel 1px putih sekali saja. */
export function ensureSpark(scene){
  if (scene.textures.exists('spark')) return;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1).fillCircle(4, 4, 4);
  g.generateTexture('spark', 8, 8);
  g.destroy();
}

/** Teks angka yang melayang naik lalu memudar (mis. "+Rp50.000"). */
export function floatText(scene, x, y, text, color='#7fc96b'){
  const t = scene.add.text(x, y, text, {
    fontFamily:'Trebuchet MS, Verdana, sans-serif',
    fontSize:'20px', fontStyle:'bold', color,
    stroke:'#14101c', strokeThickness:4,
  }).setOrigin(.5).setDepth(50);
  scene.tweens.add({
    targets:t, y:y-52, alpha:0, duration:1000, ease:'Back.easeOut',
    onComplete:()=> t.destroy(),
  });
}

/** Ledakan partikel (koin emas standar). */
export function burst(scene, x, y, tint=C.gold, count=22){
  ensureSpark(scene);
  const p = scene.add.particles(x, y, 'spark', {
    speed:{ min:-220, max:220 }, angle:{ min:0, max:360 },
    lifespan:650, gravityY:340, scale:{ start:0.9, end:0 },
    tint, quantity:count, emitting:false,
  }).setDepth(45);
  p.explode(count, x, y);
  scene.time.delayedCall(900, ()=> p.destroy());
}

/** Konfeti warna-warni (kemenangan / SHU). */
export function confetti(scene, x, y){
  [C.gold, C.coral, C.success, C.waterHi, C.ink].forEach((col,i)=>
    scene.time.delayedCall(i*90, ()=> burst(scene, x, y, col, 18)));
}

/** Getar layar. */
export function shake(scene, intensity=0.008, dur=150){
  scene.cameras.main.shake(dur, intensity);
}

/** Kilat putih sekejap di seluruh layar + getar perangkat (mobile). */
export function flash(scene, color=0xffffff, alpha=0.5){
  scene.cameras.main.flash(160, (color>>16)&255, (color>>8)&255, color&255);
  if (navigator.vibrate) { try { navigator.vibrate(25); } catch(_){} }
}
