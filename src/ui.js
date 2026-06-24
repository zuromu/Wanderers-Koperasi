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

/* Potret mini per pembicara — SVG pixel-art 30×30 */
const P = {
  kepala: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#7a5d3a"/><ellipse cx="15" cy="20" rx="7" ry="8" fill="#d4956a"/><ellipse cx="8" cy="17" rx="2" ry="4" fill="#a07840" opacity=".45"/><ellipse cx="22" cy="17" rx="2" ry="4" fill="#a07840" opacity=".45"/><rect x="8" y="7" width="14" height="7" rx="2" fill="#1a1030"/><rect x="7" y="12" width="16" height="2" rx="1" fill="#241d2e" opacity=".7"/><rect x="11" y="18" width="2" height="2" rx=".5" fill="#241d2e"/><rect x="17" y="18" width="2" height="2" rx=".5" fill="#241d2e"/><rect x="11" y="18" width="1" height="1" fill="#fff" opacity=".5"/><rect x="17" y="18" width="1" height="1" fill="#fff" opacity=".5"/><path d="M12 23q3 2 6 0" stroke="#9a5030" stroke-width="1" fill="none"/><ellipse cx="15" cy="26" rx="4" ry="2" fill="#c0a890" opacity=".4"/></svg>`,
  koperasi: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#2d6cb5"/><rect x="4" y="22" width="22" height="6" rx="1" fill="#1a4a8a"/><rect x="8" y="12" width="14" height="12" fill="#3a80d0"/><polygon points="15,4 4,12 26,12" fill="#1e5aaa"/><rect x="7" y="10" width="3" height="14" rx="1" fill="#5a98e8"/><rect x="20" y="10" width="3" height="14" rx="1" fill="#5a98e8"/><rect x="12" y="17" width="6" height="7" rx="1" fill="#1a4a8a"/><rect x="13" y="13" width="4" height="3" rx=".5" fill="#ffe8a8" opacity=".45"/></svg>`,
  bendahara: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#a9781b"/><ellipse cx="15" cy="20" rx="7" ry="8" fill="#d4956a"/><ellipse cx="8" cy="15" rx="2" ry="5" fill="#a07030" opacity=".4"/><ellipse cx="22" cy="15" rx="2" ry="5" fill="#a07030" opacity=".4"/><circle cx="11" cy="18" r="3" fill="none" stroke="#e0a52b" stroke-width="1.5"/><circle cx="19" cy="18" r="3" fill="none" stroke="#e0a52b" stroke-width="1.5"/><line x1="14" y1="18" x2="16" y2="18" stroke="#e0a52b" stroke-width="1.5"/><rect x="10.5" y="17" width="1.5" height="2" rx=".5" fill="#241d2e"/><rect x="18" y="17" width="1.5" height="2" rx=".5" fill="#241d2e"/><path d="M12 24q3 1.5 6 0" stroke="#8a4010" stroke-width="1" fill="none"/></svg>`,
  ladang: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#4a8a30"/><ellipse cx="15" cy="20" rx="7" ry="7" fill="#c07840"/><polygon points="15,5 3,14 27,14" fill="#9a7020"/><ellipse cx="15" cy="14" rx="9" ry="2.5" fill="#b88830" opacity=".7"/><line x1="15" y1="5" x2="15" y2="14" stroke="#7a5010" stroke-width="1" opacity=".6"/><rect x="11" y="18" width="2" height="2" rx=".5" fill="#241d2e"/><rect x="17" y="18" width="2" height="2" rx=".5" fill="#241d2e"/><rect x="11" y="18" width="1" height="1" fill="#fff" opacity=".5"/><path d="M12 24q3 2 6 0" stroke="#7a3010" stroke-width="1" fill="none"/></svg>`,
  pasar: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#c06030"/><ellipse cx="15" cy="20" rx="7" ry="7" fill="#d4956a"/><rect x="7" y="7" width="16" height="8" rx="3" fill="#e07028"/><ellipse cx="15" cy="14" rx="9" ry="2.5" fill="#f09040" opacity=".7"/><rect x="8" y="10" width="14" height="2" rx="1" fill="#a04010" opacity=".55"/><rect x="11" y="18" width="2" height="2" rx=".5" fill="#241d2e"/><rect x="17" y="18" width="2" height="2" rx=".5" fill="#241d2e"/><path d="M11 24q4 2.5 8 0" stroke="#7a3010" stroke-width="1" fill="none"/></svg>`,
  balai: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#5a4090"/><rect x="4" y="22" width="22" height="6" rx="1" fill="#3a2070"/><rect x="7" y="11" width="16" height="13" fill="#6a50a0"/><polygon points="15,4 4,11 26,11" fill="#3a2878"/><rect x="7" y="9" width="3" height="15" rx="1" fill="#7a60b0"/><rect x="13.5" y="9" width="3" height="15" rx="1" fill="#7a60b0"/><rect x="20" y="9" width="3" height="15" rx="1" fill="#7a60b0"/><rect x="11" y="17" width="8" height="7" rx="1" fill="#3a2070"/><rect x="13" y="13" width="4" height="3" rx=".5" fill="#c8b0f8" opacity=".3"/></svg>`,
  sumur: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#3a7090"/><rect x="6" y="16" width="18" height="11" rx="2" fill="#5090b0"/><rect x="4" y="14" width="22" height="4" rx="1" fill="#2a6080"/><rect x="7" y="7" width="3" height="10" rx="1" fill="#a07040"/><rect x="20" y="7" width="3" height="10" rx="1" fill="#a07040"/><rect x="7" y="6" width="16" height="2" rx="1" fill="#c09050"/><circle cx="15" cy="22" r="4" fill="#1a4a60"/><ellipse cx="15" cy="20" rx="4" ry="1.5" fill="#5ab0d0" opacity=".4"/><line x1="15" y1="12" x2="15" y2="16" stroke="#8a7060" stroke-width="1" stroke-dasharray="2,1"/></svg>`,
  warga: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#4a6a5a"/><ellipse cx="15" cy="20" rx="7" ry="7" fill="#d4956a"/><rect x="7" y="7" width="16" height="7" rx="3" fill="#3f9c9c"/><rect x="6" y="12" width="18" height="2" rx="1" fill="#2d8080" opacity=".65"/><rect x="11" y="18" width="2" height="2" rx=".5" fill="#241d2e"/><rect x="17" y="18" width="2" height="2" rx=".5" fill="#241d2e"/><rect x="11" y="18" width="1" height="1" fill="#fff" opacity=".5"/><rect x="17" y="18" width="1" height="1" fill="#fff" opacity=".5"/><path d="M11 24q4 2.5 8 0" stroke="#7a3010" stroke-width="1" fill="none"/></svg>`,
  wanderer: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#241d2e"/><ellipse cx="15" cy="21" rx="7" ry="7" fill="#d4956a"/><path d="M5 17Q7 4 15 4Q23 4 25 17Q22 14 15 14Q8 14 5 17Z" fill="#1a1428"/><rect x="11" y="19" width="2" height="2" rx=".5" fill="#241d2e"/><rect x="17" y="19" width="2" height="2" rx=".5" fill="#241d2e"/><rect x="11" y="19" width="1" height="1" fill="#7a60ff" opacity=".75"/><rect x="17" y="19" width="1" height="1" fill="#7a60ff" opacity=".75"/><path d="M12 25q3 1.5 6 0" stroke="#8a4020" stroke-width="1" fill="none"/></svg>`,
  warning: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#c0432f"/><polygon points="15,5 2,27 28,27" fill="#e05040" opacity=".9"/><rect x="14" y="11" width="2" height="9" rx="1" fill="#fff"/><rect x="14" y="22.5" width="2" height="2.5" rx="1" fill="#fff"/></svg>`,
  tamat: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#7fc96b"/><polygon points="15,3 18.5,10.5 27,11.5 21,17.5 22.8,26 15,22 7.2,26 9,17.5 3,11.5 11.5,10.5" fill="#e0a52b" stroke="#a9781b" stroke-width=".8"/></svg>`,
  quizCorrect: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#3a8a4f"/><circle cx="15" cy="15" r="10" fill="#4aaa60" stroke="#2a6a3f" stroke-width="1.5"/><polyline points="9,15 13,19 21,11" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  quizWrong: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#8a3020"/><circle cx="15" cy="15" r="10" fill="#b04030" stroke="#6a2010" stroke-width="1.5"/><line x1="10" y1="10" x2="20" y2="20" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="20" y1="10" x2="10" y2="20" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  quiz: `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" rx="3" fill="#2d5a8a"/><circle cx="15" cy="15" r="10" fill="#3a72b0" stroke="#1a4a7a" stroke-width="1.5"/><text x="15" y="20" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">?</text></svg>`,
};

/* Badge berwarna per pembicara untuk header dialog */
const BADGE_MAP = {
  'Kepala Desa':       { c:'#7a5d3a', i:'KD', p: P.kepala    },
  'Kantor Koperasi':   { c:'#2d6cb5', i:'K',  p: P.koperasi  },
  'Bendahara':         { c:'#a9781b', i:'B',  p: P.bendahara },
  'Ladang':            { c:'#4a8a30', i:'L',  p: P.ladang    },
  'Pasar':             { c:'#c06030', i:'P',  p: P.pasar     },
  'Balai Desa (RAT)':  { c:'#5a4090', i:'BD', p: P.balai     },
  'Balai Desa':        { c:'#5a4090', i:'BD', p: P.balai     },
  'Sumur Desa':        { c:'#3a7090', i:'S',  p: P.sumur     },
  'Warga Desa':        { c:'#4a6a5a', i:'W',  p: P.warga     },
  'Wanderer':          { c:'#241d2e', i:'?',  p: P.wanderer  },
  'Peringatan Penting':{ c:'#c0432f', i:'!',  p: P.warning      },
  'Tamat!':            { c:'#7fc96b', i:'★',  p: P.tamat        },
  'Kuis Koperasi':     { c:'#2d5a8a', i:'?',  p: P.quiz         },
  'Benar!':            { c:'#3a8a4f', i:'✓',  p: P.quizCorrect  },
  'Kurang Tepat':      { c:'#8a3020', i:'✗',  p: P.quizWrong    },
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
  dwho.innerHTML = bd.p
    ? `<span class="dlg-portrait">${bd.p}</span>${who}`
    : `<span class="who-badge" style="background:${bd.c}">${bd.i}</span>${who}`;
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
        b.setAttribute('data-disabled', '');
        b.setAttribute('aria-disabled', 'true');
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

const STAGE_BANNER = {
  LOAN:  '★ Anggota Koperasi!',
  PLANT: '◆ Modal Cair!',
  SELL:  '◆ Panen Melimpah!',
  REPAY: '◆ Waktunya Melunasi',
  RAT:   '★ Menuju RAT!',
  DONE:  '★ Siklus Selesai!',
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

  // Toast + banner sinematik saat tahap misi berubah
  if (S.stage !== lastStage){
    if (STAGE_TOAST[S.stage]) showToast(STAGE_TOAST[S.stage]);
    if (STAGE_BANNER[S.stage]) sceneRef?.stageBanner?.(STAGE_BANNER[S.stage]);
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
