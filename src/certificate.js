/**
 * certificate.js, Rapor literasi akhir + sertifikat yang bisa diunduh.
 * Bukti pembelajaran: ringkasan konsep yang dikuasai, nilai, dan sertifikat PNG.
 */
import { S, literacyGrade } from './state.js';
import { rupiah } from './data.js';
import * as Audio from './audio.js';

const CONCEPTS = [
  { key:'pokok', label:'Simpanan Pokok, dibayar sekali saat mendaftar' },
  { key:'wajib', label:'Simpanan Wajib, tabungan rutin anggota' },
  { key:'modal', label:'Pinjam Modal, koperasi vs rentenir' },
  { key:'shu',   label:'SHU, bagi hasil sesuai simpanan & keaktifan' },
  { key:'rat',   label:'RAT, Rapat Anggota Tahunan, satu anggota satu suara' },
];

function mark(key){
  if (!key) return '<span style="color:#3a8a4f">&#10003;</span>';
  if (S.quizResult[key] === true)  return '<span style="color:#3a8a4f">&#10003;</span>';
  if (S.quizResult[key] === false) return '<span style="color:#c0432f">&#9888;</span>';
  return '<span style="color:#9a8a60">&#183;</span>';
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
  const loanNote = S.loanType === 'rentenir'
    ? ` &middot; <span style="color:#c0432f">Rentenir (rugi Rp22.500 bunga)</span>`
    : (S.loanType === 'koperasi' ? ` &middot; <span style="color:#3a8a4f">Koperasi (pilihan bijak!)</span>` : '');
  el.innerHTML = `
    <div class="title-card recap-card">
      <h2>Rapor Literasi Koperasi</h2>
      <div class="grade">${g.grade}</div>
      <p class="tag" style="margin:2px 0 6px">${S.playerName}, <b>${g.title}</b><br>
         Skor kuis: ${S.quizCorrect}/${S.quizTotal} (${Math.round(g.pct*100)}%)</p>
      <ul class="recap-list">${rows}</ul>
      <p class="tag" style="font-size:13px;opacity:.85">Total kekayaan akhir: <b>${rupiah(S.money)}</b>
         &middot; SHU diterima: <b>${rupiah(S.shu)}</b>${loanNote}</p>
      <div class="title-btns">
        <button class="primary" id="btnCert">Unduh Sertifikat</button>
        <button id="btnShare">Bagikan</button>
        <button id="btnReplay">Main Lagi</button>
      </div>
    </div>`;
  // Inject floating sparkle particles into the backdrop
  const sr = (s => { let x=s; return ()=>{ x^=x<<13;x^=x>>17;x^=x<<5;return(x>>>0)/4294967295; }; })(73);
  for (let i = 0; i < 14; i++){
    const sp = document.createElement('div');
    sp.className = 'recap-spark';
    sp.style.cssText = `left:${4+sr()*92}%;top:${sr()*100}%;width:${1.5+sr()*2.5}px;height:${1.5+sr()*2.5}px;animation-delay:${sr()*7}s;animation-duration:${4+sr()*5}s`;
    el.appendChild(sp);
  }
  el.style.display = 'flex';
  Audio.play('select');
  document.getElementById('btnCert').onclick = () => { Audio.play('coin'); downloadCertificate(); };
  document.getElementById('btnReplay').onclick = () => { Audio.play('select'); location.reload(); };
  const shareBtn = document.getElementById('btnShare');
  shareBtn.onclick = async () => {
    Audio.play('select');
    const shareText = `Nilai ${g.grade} (${g.title}) di Wanderer's Koperasi Quest!\nLiterasi koperasi: ${S.quizCorrect}/${S.quizTotal} — belajar Simpanan, SHU, RAT, dan lebih. Coba juga: ${location.origin}`;
    if (navigator.share){
      try { await navigator.share({ title:"Wanderer's Koperasi Quest", text:shareText }); } catch(e){}
    } else {
      await navigator.clipboard.writeText(shareText).catch(()=>{});
      shareBtn.textContent = 'Disalin!';
      setTimeout(()=>{ shareBtn.textContent = 'Bagikan'; }, 2200);
    }
  };
}

/* ── helpers ── */
function center(x, t, y, font, color, W=1000){
  x.fillStyle = color; x.font = font; x.textAlign = 'center';
  x.fillText(t, W/2, y);
}

function drawOrnateCorner(x, cx, cy, sx, sy){
  /* multi-layer diamond corner ornament */
  const dx = sx, dy = sy;
  const sizes = [20, 13, 7];
  const colors = ['#e8a33d','#c07010','#f8d888'];
  sizes.forEach((s, i) => {
    x.fillStyle = colors[i];
    x.beginPath();
    x.moveTo(cx,      cy - s*dy);
    x.lineTo(cx + s*dx, cy     );
    x.lineTo(cx,      cy + s*dy);
    x.lineTo(cx - s*dx, cy     );
    x.closePath(); x.fill();
  });
  /* dot accents */
  x.fillStyle = '#e8a33d';
  [[0, 32*dy],[32*dx, 0],[0, -32*dy],[-32*dx, 0]].forEach(([ox,oy]) => {
    x.beginPath(); x.arc(cx+ox, cy+oy, 3, 0, Math.PI*2); x.fill();
  });
}

function drawGradeSeal(x, g, cx, cy){
  const gradeColors = { A:'#2a7a44', B:'#2a5fa8', C:'#c07a18', D:'#a83030', F:'#5a3080' };
  const col = gradeColors[g.grade] || '#2a7a44';
  const lighter = col;

  /* outer ring with 24 notches (gear/rosette effect) */
  const R = 62, notches = 24, nr = 8;
  x.fillStyle = '#fff8e8';
  x.beginPath(); x.arc(cx, cy, R+nr+2, 0, Math.PI*2); x.fill();
  x.fillStyle = col;
  x.beginPath();
  for (let i=0; i<notches; i++){
    const a0 = (i/notches)*Math.PI*2 - Math.PI/2;
    const a1 = ((i+0.5)/notches)*Math.PI*2 - Math.PI/2;
    const a2 = ((i+1)/notches)*Math.PI*2 - Math.PI/2;
    if (i===0) x.moveTo(cx + (R+nr)*Math.cos(a0), cy + (R+nr)*Math.sin(a0));
    else x.lineTo(cx + (R+nr)*Math.cos(a0), cy + (R+nr)*Math.sin(a0));
    x.lineTo(cx + R*Math.cos(a1), cy + R*Math.sin(a1));
    x.lineTo(cx + (R+nr)*Math.cos(a2), cy + (R+nr)*Math.sin(a2));
  }
  x.closePath(); x.fill();

  /* solid disc */
  x.fillStyle = col;
  x.beginPath(); x.arc(cx, cy, R-2, 0, Math.PI*2); x.fill();

  /* inner ring highlight */
  x.strokeStyle = '#fff8e8'; x.lineWidth = 2.5;
  x.beginPath(); x.arc(cx, cy, R-10, 0, Math.PI*2); x.stroke();

  /* grade letter */
  x.fillStyle = '#fff8e8'; x.font = 'bold 62px Georgia, serif'; x.textAlign = 'center';
  x.fillText(g.grade, cx, cy + 21);

  /* title below */
  x.fillStyle = col; x.font = 'italic 13px Georgia, serif'; x.textAlign = 'center';
  x.fillText(g.title, cx, cy + R + nr + 18);
}

function drawVillageSilhouette(x, W, baseY){
  x.fillStyle = 'rgba(140,100,50,0.13)';

  /* koperasi (center-left: bigger building) */
  const kx = 310;
  x.fillRect(kx, baseY-48, 88, 48);
  x.fillRect(kx+10, baseY-62, 68, 14);
  /* roof triangle */
  x.beginPath(); x.moveTo(kx-6, baseY-62); x.lineTo(kx+44, baseY-90); x.lineTo(kx+94, baseY-62); x.closePath(); x.fill();
  /* door */
  x.fillStyle = 'rgba(100,70,30,0.18)';
  x.fillRect(kx+36, baseY-28, 18, 28);
  /* windows */
  x.fillRect(kx+12, baseY-42, 16, 14); x.fillRect(kx+62, baseY-42, 16, 14);
  x.fillStyle = 'rgba(140,100,50,0.13)';

  /* smaller cottage (right of koperasi) */
  const hx = 435;
  x.fillRect(hx, baseY-36, 60, 36);
  x.beginPath(); x.moveTo(hx-4, baseY-36); x.lineTo(hx+30, baseY-58); x.lineTo(hx+64, baseY-36); x.closePath(); x.fill();
  x.fillStyle = 'rgba(100,70,30,0.18)';
  x.fillRect(hx+12, baseY-28, 12, 12); x.fillRect(hx+36, baseY-28, 12, 12);
  x.fillStyle = 'rgba(140,100,50,0.13)';

  /* small house (left) */
  const hx2 = 185;
  x.fillRect(hx2, baseY-30, 52, 30);
  x.beginPath(); x.moveTo(hx2-4, baseY-30); x.lineTo(hx2+26, baseY-52); x.lineTo(hx2+56, baseY-30); x.closePath(); x.fill();

  /* trees: lollipop style */
  [[150,baseY-44],[250,baseY-50],[545,baseY-48],[620,baseY-40],[700,baseY-46],[780,baseY-38]].forEach(([tx,ty]) => {
    x.fillRect(tx-3, ty+12, 6, 26);
    x.beginPath(); x.arc(tx, ty, 20, 0, Math.PI*2); x.fill();
  });

  /* well (right side) */
  const wx = 670, wy = baseY-24;
  x.fillRect(wx-14, wy, 28, 24);
  x.beginPath(); x.arc(wx, wy, 14, Math.PI, 0); x.fill();

  /* ground line */
  x.fillRect(0, baseY, W, 3);
}

function drawFlourish(x, cx, y){
  /* decorative swash divider */
  x.strokeStyle = '#c8a050'; x.lineWidth = 1.5;
  /* center diamond */
  x.fillStyle = '#e8a33d';
  x.beginPath(); x.moveTo(cx,y-6); x.lineTo(cx+6,y); x.lineTo(cx,y+6); x.lineTo(cx-6,y); x.closePath(); x.fill();
  /* left swirl */
  x.beginPath();
  x.moveTo(cx-10,y); x.bezierCurveTo(cx-80,y-12,cx-140,y+8,cx-200,y);
  x.stroke();
  x.beginPath();
  x.moveTo(cx+10,y); x.bezierCurveTo(cx+80,y-12,cx+140,y+8,cx+200,y);
  x.stroke();
  /* small diamonds on the swirls */
  [cx-110, cx+110].forEach(dx => {
    x.fillStyle = '#d09030';
    x.beginPath(); x.moveTo(dx,y-4); x.lineTo(dx+4,y); x.lineTo(dx,y+4); x.lineTo(dx-4,y); x.closePath(); x.fill();
  });
}

/** Buat sertifikat PNG dan unduh. */
export function downloadCertificate(){
  const g = literacyGrade();
  const W = 1000, H = 720;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');

  /* ── Background: layered parchment ── */
  const bg = x.createRadialGradient(W*0.4, H*0.35, H*0.05, W*0.5, H*0.5, H*0.85);
  bg.addColorStop(0, '#fffff8'); bg.addColorStop(0.6, '#fdf4de'); bg.addColorStop(1, '#f0e2c0');
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  /* subtle texture overlay */
  for (let i=0; i<320; i++){
    const px = Math.sin(i*17.3)*W*0.49+W*0.5, py = Math.cos(i*11.7)*H*0.46+H*0.5;
    x.fillStyle = `rgba(${i%2?180:160},${130+i%20},${50+i%30},0.025)`;
    x.fillRect(px, py, 60+i%40, 1);
  }

  /* ── Watermark: koperasi emblem ── */
  x.globalAlpha = 0.045;
  x.strokeStyle = '#8a5818'; x.lineWidth = 24;
  x.beginPath(); x.arc(W/2, H/2, 190, 0, Math.PI*2); x.stroke();
  x.lineWidth = 15;
  [[W/2, H/2-95],[W/2-82, H/2+48],[W/2+82, H/2+48]].forEach(([cx,cy]) => {
    x.beginPath(); x.arc(cx, cy, 58, 0, Math.PI*2); x.stroke();
  });
  /* gear teeth on watermark */
  x.lineWidth = 8;
  for (let i=0; i<16; i++){
    const a = (i/16)*Math.PI*2;
    const r1 = 185, r2 = 210;
    x.beginPath();
    x.moveTo(W/2 + r1*Math.cos(a), H/2 + r1*Math.sin(a));
    x.lineTo(W/2 + r2*Math.cos(a), H/2 + r2*Math.sin(a));
    x.stroke();
  }
  x.globalAlpha = 1;

  /* ── Borders: triple frame ── */
  /* outermost gold thick */
  x.strokeStyle = '#c8860c'; x.lineWidth = 12; x.strokeRect(18, 18, W-36, H-36);
  /* thin gap line */
  x.strokeStyle = '#a0600a'; x.lineWidth = 1.5; x.strokeRect(30, 30, W-60, H-60);
  /* inner dark ink frame */
  x.strokeStyle = '#1c1926'; x.lineWidth = 2.5; x.strokeRect(44, 44, W-88, H-88);
  /* innermost thin gold */
  x.strokeStyle = '#d8a040'; x.lineWidth = 1; x.strokeRect(50, 50, W-100, H-100);

  /* ── Corner ornaments ── */
  drawOrnateCorner(x,  44,  44,  1,  1);
  drawOrnateCorner(x, W-44, 44, -1,  1);
  drawOrnateCorner(x,  44, H-44, 1, -1);
  drawOrnateCorner(x, W-44, H-44, -1, -1);

  /* ── Header band ── */
  const hg = x.createLinearGradient(0, 60, 0, 118);
  hg.addColorStop(0,'rgba(232,163,61,0.0)'); hg.addColorStop(0.5,'rgba(232,163,61,0.10)'); hg.addColorStop(1,'rgba(232,163,61,0.0)');
  x.fillStyle = hg; x.fillRect(50, 60, W-100, 58);
  center(x, '— Wanderer\'s Koperasi Quest —', 106, 'italic 17px Georgia, serif', '#9a6810');

  /* ── Main title ── */
  center(x, 'SERTIFIKAT LITERASI KOPERASI', 178, 'bold 42px Georgia, serif', '#1c1926');

  /* ── Sub-divider ── */
  drawFlourish(x, W/2, 196);

  /* ── Recipient block ── */
  center(x, 'Diberikan dengan bangga kepada', 242, '19px Georgia, serif', '#6a5840');
  center(x, S.playerName, 310, 'bold 58px Georgia, serif', '#b06808');
  /* underline for name */
  x.strokeStyle = '#d8c0a0'; x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(280, 325); x.lineTo(720, 325); x.stroke();
  /* small dots at ends */
  x.fillStyle = '#e8a33d';
  [[280,325],[720,325]].forEach(([px,py]) => { x.beginPath(); x.arc(px,py,4,0,Math.PI*2); x.fill(); });

  /* ── Achievement text ── */
  center(x, 'atas keberhasilan menyelesaikan siklus koperasi dan meraih predikat', 378, '18px Georgia, serif', '#5b5160');

  /* ── Grade seal (top-right quadrant) ── */
  drawGradeSeal(x, g, 820, 310);

  /* ── Stats row ── */
  const statY = 440;
  drawFlourish(x, W/2, statY - 10);

  const gradeColors2 = { A:'#2a7a44', B:'#2a5fa8', C:'#c07a18', D:'#a83030', F:'#5a3080' };
  const gradeCol = gradeColors2[g.grade] || '#2a7a44';
  center(x, `${g.title}   (Nilai ${g.grade})`, statY + 36, 'bold 32px Georgia, serif', gradeCol);
  center(x, `Skor Kuis: ${S.quizCorrect}/${S.quizTotal}  ·  SHU Diterima: ${rupiah(S.shu)}`, statY + 76, '19px Georgia, serif', '#5b5160');

  if (S.loanType === 'koperasi'){
    center(x, '✦  Memilih pinjam dari Koperasi — keputusan yang bijak dan bertanggung jawab  ✦', statY + 112, 'italic 15px Georgia, serif', '#2a7a44');
  } else if (S.loanType === 'rentenir'){
    center(x, '⚠  Catatan: memilih rentenir (bunga 30%) — lain kali pilih koperasi!', statY + 112, 'italic 15px Georgia, serif', '#c0432f');
  }

  /* ── Village silhouette footer ── */
  const silY = H - 92;
  drawVillageSilhouette(x, W, silY);

  /* footer text */
  const d = new Date();
  const tgl = d.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  center(x, `Wanderer's Koperasi Quest  ·  ${tgl}`, H - 52, 'italic 16px Georgia, serif', '#7a6840');

  /* ── Download ── */
  const a = document.createElement('a');
  a.download = `Sertifikat-Koperasi-${S.playerName.replace(/\s+/g,'_')}.png`;
  a.href = cv.toDataURL('image/png');
  a.click();
}
