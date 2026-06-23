/**
 * demo.js, Mode demo otomatis (~60 detik) untuk juri.
 * Menjalankan seluruh siklus koperasi tanpa input: pemain berjalan ke tiap
 * lokasi, dialog dilewati otomatis, dan kuis dijawab benar. Ada keterangan
 * (caption) yang menjelaskan tiap langkah.
 */
import { S, resetState } from './state.js';
import { interact } from './quest.js';
import { advanceDialogue, isDialogueOpen, refresh } from './ui.js';

const STEPS = [
  { spot:'kepala',    cap:'Wanderer tiba di desa & bertemu Kepala Desa.' },
  { spot:'koperasi',  cap:'Mendaftar jadi anggota, membayar Simpanan Pokok.' },
  { spot:'bendahara', cap:'Meminjam modal usaha dari koperasi (bukan rentenir!).' },
  { spot:'ladang',    cap:'Membeli bibit dan mulai bertani.' },
  { spot:'pasar',     cap:'Menjual hasil panen untuk meraih untung.' },
  { spot:'koperasi',  cap:'Setor Simpanan Wajib — tabungan rutin anggota koperasi!' },
  { spot:'bendahara', cap:'Melunasi pinjaman koperasi dengan bertanggung jawab.' },
  { spot:'balai',     cap:'Menghadiri RAT & menerima SHU, untung bersama!' },
];

let running = false;
export const isDemoRunning = () => running;

const wait = ms => new Promise(r => setTimeout(r, ms));
const clickFirst = () => {
  const b = document.querySelector('#dchoices button:not([style*="not-allowed"])');
  if (b){ b.click(); return true; }
  return false;
};

function ensureCaption(){
  let c = document.getElementById('caption');
  if (!c){
    c = document.createElement('div');
    c.id = 'caption';
    document.getElementById('wrap').appendChild(c);
  }
  c.style.display = 'block';
  return c;
}

export async function runDemo(scene){
  if (running) return;
  running = true; S.demo = true;
  resetState(); refresh();
  scene.unlock();
  const cap = ensureCaption();

  for (let idx = 0; idx < STEPS.length; idx++){
    const st = STEPS[idx];
    cap.textContent = `[${idx+1}/${STEPS.length}] ${st.cap}`;
    if (scene.teleport) await scene.teleport(st.spot);
    await wait(650);
    interact(st.spot);
    // selesaikan rangkaian dialog untuk langkah ini
    let guard = 0;
    while (isDialogueOpen() && guard++ < 22){
      advanceDialogue();        // selesaikan efek ketik / tutup dialog informatif
      await wait(520);
      clickFirst();             // pilih tombol utama / jawaban benar
      await wait(520);
    }
    await wait(450);
  }

  cap.textContent = 'Selesai! Itulah siklus koperasi lengkap. Jelajahi desa bebas — ajak bicara warga untuk fakta koperasi, atau tekan H untuk glosarium!';
  await wait(2600);
  cap.style.display = 'none';
  running = false; S.demo = false;
}
