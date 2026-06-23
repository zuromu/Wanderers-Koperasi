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
  dwho.textContent = who;
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
  }
  lastMoney = S.money;

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
