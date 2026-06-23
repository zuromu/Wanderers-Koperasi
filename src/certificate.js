/**
 * certificate.js, Rapor literasi akhir + sertifikat yang bisa diunduh.
 * Bukti pembelajaran: ringkasan konsep yang dikuasai, nilai, dan sertifikat PNG.
 */
import { S, literacyGrade } from './state.js';
import { rupiah } from './data.js';
import * as Audio from './audio.js';

const CONCEPTS = [
  { key:'pokok', label:'Simpanan Pokok, dibayar sekali saat mendaftar' },
  { key:null,    label:'Simpanan Wajib, tabungan rutin anggota' },
  { key:'modal', label:'Pinjam Modal, koperasi vs rentenir' },
  { key:'shu',   label:'SHU, bagi hasil sesuai simpanan & keaktifan' },
  { key:null,    label:'RAT, Rapat Anggota Tahunan, suara tiap anggota' },
];

function mark(key){
  if (!key) return '✓';
  if (S.quizResult[key] === true) return '✅';
  if (S.quizResult[key] === false) return '⚠️';
  return '✓';
}

/** Tampilkan overlay rapor. */
export function showRecap(){
  const g = literacyGrade();
  let el = document.getElementById('recap');
  if (!el){
    el = document.createElement('div');
    el.id = 'recap';
    document.getElementById('wrap').appendChild(el);
  }
  const rows = CONCEPTS.map(c => `<li>${mark(c.key)} ${c.label}</li>`).join('');
  el.innerHTML = `
    <div class="title-card recap-card">
      <h2>📋 Rapor Literasi Koperasi</h2>
      <div class="grade">${g.grade}</div>
      <p class="tag" style="margin:2px 0 6px">${S.playerName}, <b>${g.title}</b><br>
         Skor kuis: ${S.quizCorrect}/${S.quizTotal} (${Math.round(g.pct*100)}%)</p>
      <ul class="recap-list">${rows}</ul>
      <p class="tag" style="font-size:13px;opacity:.85">Total kekayaan akhir: <b>${rupiah(S.money)}</b>
         &middot; SHU diterima: <b>${rupiah(S.shu)}</b></p>
      <div class="title-btns">
        <button class="primary" id="btnCert">⬇ Unduh Sertifikat</button>
        <button id="btnReplay">Main Lagi</button>
      </div>
    </div>`;
  el.style.display = 'flex';
  Audio.play('select');
  document.getElementById('btnCert').onclick = () => { Audio.play('coin'); downloadCertificate(); };
  document.getElementById('btnReplay').onclick = () => { Audio.play('select'); location.reload(); };
}

/** Buat sertifikat PNG dan unduh. */
export function downloadCertificate(){
  const g = literacyGrade();
  const W = 1000, H = 680;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');

  // latar
  x.fillStyle = '#fbf4e4'; x.fillRect(0, 0, W, H);
  // bingkai
  x.strokeStyle = '#e8a33d'; x.lineWidth = 10; x.strokeRect(24, 24, W-48, H-48);
  x.strokeStyle = '#1c1926'; x.lineWidth = 2; x.strokeRect(40, 40, W-80, H-80);

  const center = (t, y, font, color) => {
    x.fillStyle = color; x.font = font; x.textAlign = 'center';
    x.fillText(t, W/2, y);
  };

  center('🧑‍🌾  🏦  🌾', 130, '40px serif', '#1c1926');
  center('SERTIFIKAT LITERASI KOPERASI', 200, 'bold 40px Georgia, serif', '#1c1926');
  center('Diberikan dengan bangga kepada', 260, '20px Georgia, serif', '#5b5160');
  center(S.playerName, 330, 'bold 56px Georgia, serif', '#c47f1e');

  x.beginPath(); x.moveTo(300, 360); x.lineTo(700, 360);
  x.strokeStyle = '#d8c8a0'; x.lineWidth = 2; x.stroke();

  center(`atas keberhasilan menyelesaikan siklus koperasi dan meraih predikat`, 410, '20px Georgia, serif', '#5b5160');
  center(`${g.title}  (Nilai ${g.grade})`, 460, 'bold 34px Georgia, serif', '#3a8a4f');
  center(`Skor kuis literasi: ${S.quizCorrect}/${S.quizTotal}  ·  SHU diterima: ${rupiah(S.shu)}`, 510, '20px Georgia, serif', '#5b5160');

  const d = new Date();
  const tgl = d.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  center(`Wanderer's Koperasi Quest  ·  ${tgl}`, 600, 'italic 18px Georgia, serif', '#8a7d5a');

  const a = document.createElement('a');
  a.download = `Sertifikat-Koperasi-${S.playerName.replace(/\s+/g,'_')}.png`;
  a.href = cv.toDataURL('image/png');
  a.click();
}
