/**
 * ui.js, Lapisan tampilan DOM: kotak dialog (dengan efek ketik), HUD, papan
 * misi. Juga menyalurkan efek "juice" ke scene saat uang berubah.
 */

import { S, questInfo } from './state.js';
import { rupiah } from './data.js';
import * as Audio from './audio.js';
import { showRecap } from './certificate.js';

let sceneRef = null;
export function setSceneRef(scene){ sceneRef = scene; }

/* Badge berwarna per pembicara untuk header dialog */
const BADGE_MAP = {
  'Kepala Desa':       { c:'#7a5d3a', i:'KD' },
  'Kantor Koperasi':   { c:'#2d6cb5', i:'K'  },
  'Bendahara':         { c:'#a9781b', i:'B'  },
  'Ladang':            { c:'#4a8a30', i:'L'  },
  'Pasar':             { c:'#c06030', i:'P'  },
  'Balai Desa (RAT)':  { c:'#5a4090', i:'BD' },
  'Balai Desa':        { c:'#5a4090', i:'BD' },
  'Sumur Desa':        { c:'#3a7090', i:'S'  },
  'Warga Desa':        { c:'#4a6a5a', i:'W'  },
  'Wanderer':          { c:'#241d2e', i:'?'  },
  'Peringatan Penting':{ c:'#c0432f', i:'!'  },
  'Tamat!':            { c:'#7fc96b', i:'★'  },
};

/* ---------------- Dialog (dengan efek ketik) ---------------- */
let dialogueOpen = false, pendingClose = null;
let typing = false, typeTimer = null, fullText = '', pendingChoices = null;

const dlg = document.getElementById('dlg');
const dwho = document.getElementById('dwho');
const dtxt = document.getElementById('dtxt');
const dchoices = document.getElementById('dchoices');
const darrow = document.getElementById('darrow');

export const isDialogueOpen = () => dialogueOpen;

export function showDialogue(who, text, choices){
  dialogueOpen = true; pendingClose = null; pendingChoices = choices || null;
  const bd = BADGE_MAP[who] || { c:'#241d2e', i:who[0] };
  dwho.innerHTML = `<span class="who-badge" style="background:${bd.c}">${bd.i}</span>${who}`;
  dchoices.innerHTML = '';
  if (darrow) darrow.style.display = 'none';
  dlg.classList.remove('dlg-open');
  dlg.style.display = 'block';
  requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('dlg-open')));
  Audio.play('talk');
  startTyping(text);
}

function startTyping(text){
  fullText = text; typing = true;
  dtxt.textContent = '';
  let i = 0;
  clearInterval(typeTimer);
  typeTimer = setInterval(() => {
    dtxt.textContent = fullText.slice(0, ++i);
    if (i % 2 === 0) Audio.play('type');
    if (i >= fullText.length){ clearInterval(typeTimer); finishTyping(); }
  }, 16);
}

function finishTyping(){
  typing = false; clearInterval(typeTimer);
  dtxt.textContent = fullText;
  renderChoices(pendingChoices);
}

function renderChoices(choices){
  dchoices.innerHTML = '';
  if (choices && choices.length){
    choices.forEach(ch => {
      const b = document.createElement('button');
      if (ch.cond === false){
        b.textContent = ch.label + ' (saldo kurang)';
        b.style.opacity = .5; b.style.cursor = 'not-allowed';
      } else {
        b.textContent = ch.label;
        b.onclick = () => { Audio.play('select'); if (ch.go) ch.go(); };
      }
      dchoices.appendChild(b);
    });
    if (darrow) darrow.style.display = 'none';
  } else {
    pendingClose = true;
    if (darrow) darrow.style.display = 'block';
  }
}

/** Spasi saat dialog terbuka: lewati efek ketik, lalu tutup bila informatif. */
export function advanceDialogue(){
  if (typing){ finishTyping(); return; }
  if (pendingClose) closeDialogue();
}

export function closeDialogue(){
  dialogueOpen = false; typing = false; clearInterval(typeTimer);
  dlg.classList.remove('dlg-open');
  dlg.style.display = 'none';
  if (darrow) darrow.style.display = 'none';
  refresh();
}

export function advance(){ closeDialogue(); }

/* ---------------- HUD & papan misi ---------------- */
let lastMoney = S.money;
let lastStage = S.stage;

const STAGE_TOAST = {
  JOIN:  'Selamat datang! Kunjungi Kantor Koperasi.',
  LOAN:  'Simpanan diterima! Saatnya pinjam modal.',
  PLANT: 'Modal cair! Kunjungi Ladang untuk bertani.',
  SELL:  'Panen siap! Jual di Pasar.',
  REPAY: 'Untung terkumpul! Lunasi pinjaman ke Bendahara.',
  RAT:   'Pinjaman lunas! Hadiri RAT di Balai Desa.',
  DONE:  'Siklus koperasi selesai — kamu luar biasa!',
};

function showToast(msg){
  let t = document.getElementById('toast');
  if (!t){
    t = document.createElement('div');
    t.id = 'toast';
    document.getElementById('wrap').appendChild(t);
  }
  t.textContent = msg;
  t.classList.remove('toast-in');
  requestAnimationFrame(()=> requestAnimationFrame(()=> t.classList.add('toast-in')));
}

export function refresh(){
  document.getElementById('money').textContent    = rupiah(S.money);
  document.getElementById('simpanan').textContent = rupiah(S.simpananPokok + S.simpananWajib);
  document.getElementById('harvest').textContent  = S.harvest;
  document.getElementById('member').textContent   = S.isMember ? 'Anggota' : 'Calon Anggota';

  const q = questInfo();
  document.getElementById('qtitle').textContent = q.title;
  document.getElementById('qobj').textContent   = q.objective;
  const fill  = document.getElementById('qstep-fill');
  const label = document.getElementById('qstep-label');
  if (fill)  fill.style.width  = q.step ? (q.step / q.total * 100).toFixed(1) + '%' : '0%';
  if (label) label.textContent = q.step ? q.step + ' / ' + q.total : '';

  // Efek juice saat saldo berubah
  if (sceneRef && sceneRef.moneyFx && S.money !== lastMoney){
    sceneRef.moneyFx(S.money - lastMoney);
    const moneyChip = document.getElementById('money')?.closest?.('.chip');
    if (moneyChip){
      moneyChip.classList.remove('chip-pulse');
      requestAnimationFrame(()=> moneyChip.classList.add('chip-pulse'));
    }
  }
  lastMoney = S.money;

  // Toast saat tahap misi berubah
  if (S.stage !== lastStage){
    if (STAGE_TOAST[S.stage]) showToast(STAGE_TOAST[S.stage]);
    lastStage = S.stage;
  }

  if (sceneRef && sceneRef.updateMarker) sceneRef.updateMarker();
}

/** Layar kemenangan + konfeti + rapor/sertifikat. */
export function winScreen(){
  if (sceneRef && sceneRef.celebrate) sceneRef.celebrate();
  showDialogue('Tamat!',
    `Kamu telah menyelesaikan siklus koperasi: jadi anggota (Simpanan Pokok), menabung ` +
    `(Simpanan Wajib), pinjam modal, berusaha tani, melunasi pinjaman, dan menerima SHU di RAT. ` +
    `Total uang akhir: ${rupiah(S.money)}. Inilah koperasi, dari, oleh, untuk anggota!`,
    [
      { label:'Lihat Rapor & Sertifikat', go:()=>{ closeDialogue(); showRecap(); } },
      { label:'Jelajahi bebas', go: closeDialogue },
    ]);
}
