/**
 * quiz.js, Kuis mikro per-konsep untuk MENGUKUR pemahaman koperasi.
 * Muncul di titik-titik kunci; benar/salah dicatat untuk nilai literasi.
 * Saat mode demo, jawaban benar dipilih otomatis.
 */
import { S } from './state.js';
import { showDialogue } from './ui.js';
import * as Audio from './audio.js';

export const QUIZZES = {
  pokok: {
    q: 'KUIS: Simpanan Pokok dalam koperasi dibayar...',
    options: [
      { t: 'Sekali, saat mendaftar jadi anggota', correct: true },
      { t: 'Setiap bulan tanpa henti', correct: false },
      { t: 'Hanya kalau koperasi rugi', correct: false },
    ],
    right: 'Tepat! Simpanan Pokok dibayar SEKALI saat menjadi anggota.',
    wrong: 'Simpanan Pokok dibayar SEKALI di awal. Yang dibayar rutin tiap bulan adalah Simpanan Wajib.',
  },
  modal: {
    q: 'KUIS: Kenapa pinjam modal ke KOPERASI lebih baik daripada ke rentenir?',
    options: [
      { t: 'Bunga/biaya jauh lebih ringan & hasilnya kembali ke anggota', correct: true },
      { t: 'Rentenir selalu memberi uang lebih banyak', correct: false },
      { t: 'Tidak ada bedanya sama sekali', correct: false },
    ],
    right: 'Benar! Koperasi memberi pinjaman murah dan keuntungannya dinikmati anggota sendiri.',
    wrong: 'Koperasi lebih baik: biayanya ringan dan keuntungan kembali ke anggota, bukan ke rentenir.',
  },
  shu: {
    q: 'KUIS: SHU (Sisa Hasil Usaha) dibagikan ke anggota berdasarkan...',
    options: [
      { t: 'Besar simpanan & jasa/transaksi tiap anggota', correct: true },
      { t: 'Diundi secara acak', correct: false },
      { t: 'Sama rata tanpa melihat kontribusi', correct: false },
    ],
    right: 'Tepat! SHU dibagi adil sesuai simpanan dan keaktifan tiap anggota.',
    wrong: 'SHU bukan undian: dibagi sesuai besar simpanan dan jasa/transaksi tiap anggota.',
  },
};

/**
 * Tampilkan kuis. Memanggil onDone() setelah pemain menjawab (apa pun hasilnya).
 * Jawaban benar pada percobaan pertama menambah skor literasi.
 */
export function askQuiz(key, onDone){
  const quiz = QUIZZES[key];
  if (!quiz || S.quizAsked[key]) { onDone && onDone(); return; }
  S.quizAsked[key] = true;
  S.quizTotal++;

  const finish = (correct) => {
    S.quizResult[key] = correct;
    if (correct) { S.quizCorrect++; Audio.play('success'); }
    else Audio.play('error');
    showDialogue(correct ? 'Benar!' : 'Kurang Tepat',
      correct ? quiz.right : quiz.wrong,
      [{ label: 'Lanjut', go: () => onDone && onDone() }]);
  };

  // Opsi diacak agar jawaban benar tidak selalu di posisi pertama -
  // KECUALI mode demo, supaya demo cukup menekan tombol pertama (yang benar).
  let opts = quiz.options.map((o, i) => ({ ...o, i }));
  if (!S.demo) opts = shuffle(opts);

  const choices = opts.map(o => ({ label: o.t, go: () => finish(o.correct) }));
  showDialogue('Kuis Koperasi', quiz.q, choices);
}

function shuffle(a){
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
