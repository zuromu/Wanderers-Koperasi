/**
 * audio.js, Audio 100% disintesis lewat Web Audio API (tanpa file aset).
 * Menyediakan efek suara (SFX) dan musik latar chiptune yang lembut.
 * AudioContext dibuat malas saat interaksi pertama (kebijakan autoplay browser).
 */

let ctx = null;
let master = null;
let muted = false;
let musicTimer = null;

function ensure(){
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  return ctx;
}

/** Bunyikan satu nada singkat. */
function blip(freq, dur, type='square', vol=0.25, slideTo=null){
  if (!ensure() || muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(master);
  osc.start(t); osc.stop(t + dur + 0.02);
}

function chord(freqs, dur, type='triangle', vol=0.2){
  freqs.forEach((f,i)=> setTimeout(()=> blip(f, dur, type, vol), i*70));
}

/** Pustaka SFX berdasarkan jenis kejadian. */
export const SFX = {
  move:    ()=> blip(220, 0.06, 'square', 0.12),
  talk:    ()=> blip(520, 0.05, 'square', 0.10),
  type:    ()=> blip(680, 0.02, 'square', 0.05),
  select:  ()=> blip(440, 0.08, 'square', 0.18, 660),
  coin:    ()=> { blip(880,0.07,'square',0.2,1320); setTimeout(()=>blip(1320,0.12,'square',0.18),60); },
  pay:     ()=> blip(330, 0.18, 'sawtooth', 0.16, 180),
  error:   ()=> blip(200, 0.25, 'sawtooth', 0.2, 90),
  success: ()=> chord([523,659,784,1046], 0.25, 'triangle', 0.22),
  fanfare: ()=> { chord([523,659,784],0.3,'triangle',0.22); setTimeout(()=>chord([784,988,1175,1568],0.5,'triangle',0.24),300); },
  advance: ()=> { blip(659,0.12,'triangle',0.15); setTimeout(()=>blip(784,0.14,'triangle',0.14),120); setTimeout(()=>blip(1046,0.2,'triangle',0.16),240); },
};

export function play(name){ const fn = SFX[name]; if (fn) fn(); }

/* ---------------- Musik latar (loop pentatonik lembut) ---------------- */
const MELODY  = [523,587,659,784,880,784,659,587,523,440,392,440]; // C pentatonic
const HARMONY = [659,784,880,1046,1046,880,784,659,659,523,523,659]; // third/fifth above
const BASS    = [131,131,165,165,196,196,165,131];
let mi = 0, bi = 0;

export function startMusic(){
  if (!ensure() || musicTimer) return;
  const step = 360;
  musicTimer = setInterval(()=>{
    if (muted) return;
    const idx = mi % MELODY.length;
    blip(MELODY[idx],  0.32, 'square',   0.05);
    blip(HARMONY[idx], 0.30, 'triangle', 0.025); // tierce harmoni, lebih pelan
    mi++;
    if (mi % 2 === 0){ blip(BASS[bi % BASS.length], 0.5, 'triangle', 0.06); bi++; }
  }, step);
}

export function stopMusic(){ if (musicTimer){ clearInterval(musicTimer); musicTimer = null; } }

export function toggleMute(){
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

export function isMuted(){ return muted; }
