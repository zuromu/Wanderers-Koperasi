/**
 * main.js — Titik masuk: konfigurasi & boot Phaser, plus glue untuk layar judul,
 * tombol bisukan, dan memulai musik pada interaksi pertama.
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

const game = new Phaser.Game(config);

/* ---------- Layar judul / tentang / bisukan ---------- */
const $ = id => document.getElementById(id);

function captureName(){
  const v = $('nameInput')?.value.trim();
  if (v) S.playerName = v.slice(0, 20);
}

function startGame(){
  captureName();
  Audio.startMusic();
  Audio.play('select');
  const t = $('title'); if (t) t.style.display = 'none';
  const h = $('hint'); if (h) h.style.display = 'block';
  const v = game.scene.getScene('Village');
  if (v && v.unlock) v.unlock();
}

function startDemo(){
  captureName();
  Audio.startMusic();
  Audio.play('select');
  $('title').style.display = 'none';
  const v = game.scene.getScene('Village');
  if (v) runDemo(v);
}

$('btnPlay')?.addEventListener('click', startGame);
$('btnDemo')?.addEventListener('click', startDemo);
$('btnAbout')?.addEventListener('click', ()=>{ $('title').style.display='none'; $('about').style.display='flex'; Audio.play('select'); });
$('btnBack')?.addEventListener('click', ()=>{ $('about').style.display='none'; $('title').style.display='flex'; Audio.play('select'); });

$('mute')?.addEventListener('click', ()=>{
  const m = Audio.toggleMute();
  $('mute').textContent = m ? '🔇' : '🔊';
});

/* ---------- Kontrol sentuh ---------- */
const scene = () => game.scene.getScene('Village');
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

// Handle debug opsional (berguna untuk pengetesan di konsol browser).
window.WKQ = { game, S, questInfo, interact, refresh, resetState, Audio, advanceDialogue, closeDialogue };
