/**
 * main.js, Titik masuk: konfigurasi & boot Phaser (setelah font siap),
 * plus glue untuk layar judul, tombol bisukan, dan kontrol sentuh.
 */

import { W, H } from './data.js';
import { Village } from './scene.js';
import { S, questInfo, resetState } from './state.js';
import { interact } from './quest.js';
import { refresh, advanceDialogue, closeDialogue } from './ui.js';
import { runDemo } from './demo.js';
import * as Audio from './audio.js';

const config = {
  type: Phaser.CANVAS,
  width: W,
  height: H,
  parent: 'game',
  backgroundColor: '#0e1018',
  pixelArt: false,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: [Village],
};

let game = null;
const $ = id => document.getElementById(id);
const scene = () => game?.scene?.getScene('Village');

/* Boot Phaser setelah font siap agar teks Phaser memakai font yang benar */
document.fonts.ready.then(() => {
  game = new Phaser.Game(config);
  window.WKQ = { get game(){ return game; }, S, questInfo, interact, refresh, resetState, Audio, advanceDialogue, closeDialogue };
});

/* ---------- Layar judul / tentang ---------- */
function captureName(){
  const v = $('nameInput')?.value.trim();
  if (v) S.playerName = v.slice(0, 20);
}

function startGame(){
  captureName();
  Audio.startMusic();
  Audio.play('select');
  const t = $('title'); if (t) t.style.display = 'none';
  const h = $('hint');  if (h) h.style.display = 'block';
  scene()?.unlock?.();
}

function startDemo(){
  captureName();
  Audio.startMusic();
  Audio.play('select');
  $('title').style.display = 'none';
  const v = scene();
  if (v) runDemo(v);
}

/* Partikel judul: gold sparks (22), drifting (8), twinkle (6) */
const tp = $('titleParticles');
if (tp){
  for (let i=0; i<36; i++){
    const sp = document.createElement('div');
    const rnd = Math.random();
    const sz = 2 + Math.random()*3.5;
    const left = Math.random()*100;
    const bot  = 5 + Math.random()*72;
    const dur  = 4 + Math.random()*7;
    const del  = -Math.random()*12;
    if (i < 22){
      sp.className = 't-spark';
      const goldVar = Math.random() < 0.3 ? '#f5d060' : '#e0a52b';
      sp.style.cssText = `left:${left}%;bottom:${bot}%;width:${sz}px;height:${sz}px;` +
        `background:${goldVar};animation-duration:${dur}s;animation-delay:${del}s`;
    } else if (i < 30){
      sp.className = 't-drift';
      const dx = (Math.random()-0.5)*28;
      sp.style.cssText = `left:${left}%;bottom:${bot}%;width:${sz*0.9}px;height:${sz*0.9}px;` +
        `background:${Math.random()<0.5?'#e0a52b':'#fffae8'};` +
        `--dx:${dx}px;animation-duration:${dur+1}s;animation-delay:${del}s`;
    } else {
      sp.className = 't-twinkle';
      const tsz = 1.5 + Math.random()*2;
      sp.style.cssText = `left:${left}%;bottom:${bot}%;width:${tsz}px;height:${tsz}px;` +
        `animation-duration:${2.5+Math.random()*3}s;animation-delay:${del}s`;
    }
    tp.appendChild(sp);
  }
}

$('btnPlay')?.addEventListener('click', startGame);
$('btnDemo')?.addEventListener('click', startDemo);
$('btnAbout')?.addEventListener('click', ()=>{ $('title').style.display='none'; $('about').style.display='flex'; Audio.play('select'); });
$('btnBack')?.addEventListener('click',  ()=>{ $('about').style.display='none'; $('title').style.display='flex'; Audio.play('select'); });

/* ---------- Bisukan ---------- */
$('mute')?.addEventListener('click', ()=>{
  const m = Audio.toggleMute();
  $('mute').innerHTML = m ? '&#x2715;' : '&#9835;';
});

/* ---------- Kontrol sentuh ---------- */
function hideHint(){ const h = $('hint'); if (h) h.style.display = 'none'; }

document.querySelectorAll('#dpad button').forEach(btn => {
  const dir = btn.getAttribute('data-dir');
  const press = (e) => {
    e.preventDefault();
    const v = scene(); if (!v) return;
    if (dir === 'act') v.action(); else { v.stepDir(dir); hideHint(); }
  };
  btn.addEventListener('pointerdown', press);
});

/* ---------- Bantuan / glosarium ---------- */
function toggleHelp(force){
  const o = $('helpOverlay'); if (!o) return;
  const show = force ?? (o.style.display !== 'flex');
  o.style.display = show ? 'flex' : 'none';
  Audio.play('select');
}
$('help')?.addEventListener('click', ()=> toggleHelp(true));
$('btnHelpClose')?.addEventListener('click', ()=> toggleHelp(false));
window.addEventListener('keydown', (e)=>{
  if (e.code === 'KeyH') toggleHelp();
  hideHint();
});
