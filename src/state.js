/**
 * state.js, State pemain + state machine misi (quest).
 *
 * `S` adalah satu-satunya sumber kebenaran untuk progres pemain.
 * `questInfo()` adalah STATE MACHINE berbasis switch/case (sesuai proposal):
 * ia menerjemahkan `S.stage` menjadi judul & tujuan misi yang aktif.
 */

/** State pemain, satu sumber kebenaran. */
export const S = {
  money: 100000,        // uang saku awal Wanderer
  isMember: false,      // sudah jadi anggota koperasi?
  simpananPokok: 0,     // simpanan pokok (sekali bayar saat mendaftar)
  simpananWajib: 0,     // simpanan wajib (rutin)
  loan: 0,              // sisa pinjaman ke koperasi
  seeds: 0,             // bibit
  harvest: 0,           // hasil panen siap jual
  shu: 0,               // Sisa Hasil Usaha yang diterima
  rounds: 0,            // berapa kali siklus tanam-panen
  stage: 'INTRO',       // tahap misi aktif, dikendalikan switch/case di bawah
  // --- literasi & meta ---
  playerName: 'Wanderer',
  quizCorrect: 0,       // jawaban kuis benar (percobaan pertama)
  quizTotal: 0,         // jumlah kuis yang sudah ditanyakan
  quizAsked: {},        // set kunci kuis yang sudah ditanyakan
  quizResult: {},       // hasil tiap kuis: key -> true/false
  loanType: null,       // 'koperasi' | 'rentenir'
  demo: false,          // mode demo otomatis (untuk juri)
};

/** Kembalikan state awal (dipakai saat "main lagi"). */
export function resetState(){
  const name = S.playerName, demo = S.demo;
  Object.assign(S, {
    money:100000, isMember:false, simpananPokok:0, simpananWajib:0,
    loan:0, seeds:0, harvest:0, shu:0, rounds:0, stage:'INTRO',
    playerName:name, quizCorrect:0, quizTotal:0, quizAsked:{}, quizResult:{}, loanType:null, demo,
  });
}

/** Nilai literasi koperasi berdasarkan kuis. */
export function literacyGrade(){
  const pct = S.quizTotal ? S.quizCorrect / S.quizTotal : 0;
  if (pct >= 0.9) return { grade:'A', title:'Anggota Teladan', pct };
  if (pct >= 0.7) return { grade:'B', title:'Kader Koperasi', pct };
  if (pct >= 0.5) return { grade:'C', title:'Anggota Aktif', pct };
  return { grade:'D', title:'Calon Anggota', pct };
}

/**
 * STATE MACHINE MISI (switch/case).
 * Mengembalikan { title, objective, target } untuk tahap saat ini.
 * `target` = id spot yang harus dituju (untuk penanda emas di peta).
 */
export function questInfo(){
  switch (S.stage){
    case 'INTRO':
      return { title:'Selamat Datang, Wanderer',
               objective:'Temui 🧑‍🌾 Kepala Desa di kiri atas.', target:'kepala' };
    case 'JOIN':
      return { title:'Jadi Anggota Koperasi',
               objective:'Pergi ke 🏦 Kantor Koperasi, bayar Simpanan Pokok (Rp50.000).', target:'koperasi' };
    case 'LOAN':
      return { title:'Pinjam Modal Usaha',
               objective:'Temui 💼 Bendahara, pinjam modal Rp75.000 untuk beli bibit.', target:'bendahara' };
    case 'PLANT':
      return { title:'Mulai Bertani',
               objective:'Ke 🌾 Ladang, beli & tanam bibit (Rp60.000).', target:'ladang' };
    case 'SELL':
      return { title:'Jual Hasil Panen',
               objective:'Bawa panen ke 🏪 Pasar dan jual untuk untung.', target:'pasar' };
    case 'REPAY':
      return { title:'Lunasi Pinjaman',
               objective:'Kembali ke 💼 Bendahara, lunasi pinjaman koperasi.', target:'bendahara' };
    case 'RAT':
      return { title:'Rapat Anggota Tahunan',
               objective:'Hadiri 🏛️ RAT di Balai Desa untuk terima SHU.', target:'balai' };
    case 'DONE':
      return { title:'Misi Selesai! 🎉',
               objective:'Kamu paham siklus koperasi. Jelajahi bebas!', target:null };
    default:
      return { title:'Misi', objective:'...', target:null };
  }
}
