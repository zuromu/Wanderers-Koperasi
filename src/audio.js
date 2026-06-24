/**
 * audio.js — Audio 100% disintesis lewat Web Audio API (tanpa file aset).
 * Menyediakan efek suara (SFX) dan musik latar chiptune yang lembut.
 * AudioContext dibuat malas saat interaksi pertama (kebijakan autoplay browser).
 */

let ctx = null;
let master = null;
let muted = false;
let musicTimer = null;
let musicRunning = false;

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

/** Mono white-noise buffer. */
function makeNoiseBurst(durationSec){
  if (!ctx) return null;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * durationSec), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** Bunyikan satu nada singkat. Attack-ramp menghilangkan click/pop artifact. */
function blip(freq, dur, type='square', vol=0.25, slideTo=null){
  if (!ensure() || muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  const ATK = type === 'sine' ? 0.015 : 0.003;
  g.gain.linearRampToValueAtTime(vol, t + ATK);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(master);
  osc.start(t); osc.stop(t + dur + 0.02);
}

function chord(freqs, dur, type='triangle', vol=0.2){
  freqs.forEach((f,i)=> setTimeout(()=> blip(f, dur, type, vol), i*70));
}

function kick(){
  if (!ensure() || muted) return;
  const t = ctx.currentTime;
  // Click transient
  const click = ctx.createOscillator();
  const cg = ctx.createGain();
  click.type = 'sine';
  click.frequency.value = 3000;
  cg.gain.setValueAtTime(0.4, t);
  cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.01);
  click.connect(cg); cg.connect(master);
  click.start(t); click.stop(t + 0.012);
  // Pitch-sweep body with 2ms linear attack
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.18);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.26, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  osc.connect(g); g.connect(master);
  osc.start(t); osc.stop(t + 0.24);
}

function hihat(){
  if (!ensure() || muted) return;
  const t = ctx.currentTime;
  const buf = makeNoiseBurst(0.045);
  if (!buf) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const flt = ctx.createBiquadFilter();
  flt.type = 'highpass';
  flt.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.03, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  src.connect(flt); flt.connect(g); g.connect(master);
  src.start(t);
}

/** Footstep sound — noise burst filtered by surface type. */
function footstep(surface){
  if (!ensure() || muted) return;
  const t = ctx.currentTime;
  const buf = makeNoiseBurst(0.06);
  if (!buf) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = 0.9 + Math.random() * 0.2;
  const flt = ctx.createBiquadFilter();
  if (surface === 'grass') {
    flt.type = 'lowpass';
    flt.frequency.value = 300;
    flt.Q.value = 1.5;
  } else {
    flt.type = 'bandpass';
    flt.frequency.value = 1800;
    flt.Q.value = 4.0;
  }
  const g = ctx.createGain();
  const vol = surface === 'grass' ? 0.12 : 0.18;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
  src.connect(flt); flt.connect(g); g.connect(master);
  src.start(t);
}

/** Pustaka SFX berdasarkan jenis kejadian. */
export const SFX = {
  move:      ()=> blip(220, 0.06, 'square', 0.12),
  stepPath:  ()=> footstep('path'),
  stepGrass: ()=> footstep('grass'),
  talk:    ()=> blip(520, 0.05, 'square', 0.10),
  type:    ()=> blip(680, 0.02, 'square', 0.05),
  select:  ()=> blip(440, 0.08, 'square', 0.18, 660),
  coin:    ()=> { blip(880,0.07,'square',0.2,1320); setTimeout(()=>blip(1320,0.12,'square',0.18),60); },
  pay:     ()=> blip(330, 0.18, 'sawtooth', 0.16, 180),
  error:   ()=> blip(200, 0.25, 'sawtooth', 0.2, 90),
  success: ()=> chord([523,659,784,1046], 0.25, 'triangle', 0.22),
  fanfare: ()=> { chord([523,659,784],0.3,'triangle',0.22); setTimeout(()=>chord([784,988,1175,1568],0.5,'triangle',0.24),300); },
  advance: ()=> { blip(659,0.12,'triangle',0.15); setTimeout(()=>blip(784,0.14,'triangle',0.14),120); setTimeout(()=>blip(1046,0.2,'triangle',0.16),240); },
  chirp:   ()=> {
    const base = 880 + Math.random()*220;
    [base, base*1.25, base, base*1.5, base].forEach((f,i) =>
      setTimeout(()=> blip(f, 0.04, 'triangle', 0.022), i*85));
  },
};

export function play(name){ const fn = SFX[name]; if (fn) fn(); }

/* ---------------- Musik latar (drift-free, pentatonik lembut) ---------------- */
const MELODY_A = [523,587,659,784,880,784,659,587,523,440,392,440];
const MELODY_B = MELODY_A.map(f => Math.round(f * 1.0595)); // up one semitone
const HARMONY  = [659,784,880,1046,1046,880,784,659,659,523,523,659];
const BASS     = [131,131,165,165,196,196,165,131];
const BEAT_SEC = 0.36;
let bi = 0, phrase = 0;

function tick(beatTime, beatNum){
  if (!musicRunning) return;

  if (!muted) {
    const phrasePos = beatNum % 16;
    if (phrasePos === 0 && beatNum > 0) phrase++;

    const useB = (phrase % 2) === 1;
    const MELODY = useB ? MELODY_B : MELODY_A;
    const idx = beatNum % MELODY.length;

    if (Math.random() > 0.15) blip(MELODY[idx], 0.32, 'square', 0.05);
    blip(HARMONY[idx], 0.30, 'triangle', 0.025);

    if (phrasePos % 4 === 0) {
      if (!useB || (phrasePos !== 4 && phrasePos !== 12)) kick();
    }
    if (phrasePos % 2 === 1) hihat();

    if (beatNum % 2 === 0) { blip(BASS[bi % BASS.length], 0.5, 'triangle', 0.06); bi++; }
  }

  const nextTime = beatTime + BEAT_SEC;
  const delay = Math.max(0, (nextTime - ctx.currentTime - 0.05) * 1000);
  musicTimer = setTimeout(() => tick(nextTime, beatNum + 1), delay);
}

export function startMusic(){
  if (!ensure() || musicRunning) return;
  musicRunning = true;
  phrase = 0; bi = 0;
  tick(ctx.currentTime, 0);
}

export function stopMusic(){
  musicRunning = false;
  if (musicTimer){ clearTimeout(musicTimer); musicTimer = null; }
}

export function toggleMute(){
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

export function isMuted(){ return muted; }
