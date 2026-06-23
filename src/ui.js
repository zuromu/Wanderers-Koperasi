/**
 * ui.js — Lapisan tampilan: kotak dialog (DOM overlay) + HUD + papan misi.
 * Dipisah dari logika game agar mudah diganti/ditingkatkan tampilannya.
 */

import { S, questInfo } from './state.js';
import { rupiah } from './data.js';

/* Referensi scene Phaser, didaftarkan oleh scene saat create(). */
let sceneRef = null;
export function setSceneRef(scene){ sceneRef = scene; }

/* ---------------- Dialog ---------------- */
let dialogueOpen = false, pendingClose = null;
const dlg = document.getElementById('dlg');
const dwho = document.getElementById('dwho');
const dtxt = document.getElementById('dtxt');
const dchoices = document.getElementById('dchoices');

export const isDialogueOpen = () => dialogueOpen;

/**
 * Tampilkan dialog.
 * @param {string} who   nama pembicara
 * @param {string} text  isi dialog
 * @param {Array<{label:string, go?:Function, cond?:boolean}>} [choices]
 *        Bila kosong: tekan Spasi untuk menutup. `cond:false` => tombol nonaktif.
 */
export function showDialogue(who, text, choices){
  dialogueOpen = true; pendingClose = null;
  dwho.textContent = who; dtxt.textContent = text;
  dchoices.innerHTML = '';

  if (choices && choices.length){
    choices.forEach(ch => {
      const b = document.createElement('button');
      if (ch.cond === false){                 // syarat tak terpenuhi -> nonaktif
        b.textContent = ch.label + ' (saldo kurang)';
        b.style.opacity = .5; b.style.cursor = 'not-allowed';
      } else {
        b.textContent = ch.label;
        b.onclick = () => { if (ch.go) ch.go(); };
      }
      dchoices.appendChild(b);
    });
  } else {
    pendingClose = true;                       // dialog informatif -> Spasi menutup
  }
  dlg.style.display = 'block';
}

/** Dipanggil saat Spasi ditekan ketika dialog terbuka. */
export function advanceDialogue(){ if (pendingClose) closeDialogue(); }

export function closeDialogue(){
  dialogueOpen = false; dlg.style.display = 'none'; refresh();
}

/** Alias semantik: tutup dialog lalu lanjut. */
export function advance(){ closeDialogue(); }

/* ---------------- HUD & papan misi ---------------- */
export function refresh(){
  document.getElementById('money').textContent    = rupiah(S.money);
  document.getElementById('simpanan').textContent = rupiah(S.simpananPokok + S.simpananWajib);
  document.getElementById('harvest').textContent  = S.harvest;
  document.getElementById('member').textContent   = S.isMember ? 'Anggota ✓' : 'Calon Anggota';

  const q = questInfo();
  document.getElementById('qtitle').textContent = '📜 ' + q.title;
  document.getElementById('qobj').textContent   = q.objective;

  if (sceneRef && sceneRef.updateMarker) sceneRef.updateMarker();
}

/** Layar kemenangan setelah menerima SHU di RAT. */
export function winScreen(){
  showDialogue('🎉 Tamat',
    `Kamu telah menyelesaikan siklus koperasi: jadi anggota (Simpanan Pokok), menabung ` +
    `(Simpanan Wajib), pinjam modal, berusaha tani, melunasi pinjaman, dan menerima SHU di RAT. ` +
    `Total uang akhir: ${rupiah(S.money)}. Inilah koperasi — dari, oleh, untuk anggota!`,
    [{ label:'Main lagi (bebas)', go: closeDialogue }]);
}
