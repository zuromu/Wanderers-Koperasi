/**
 * quest.js, Logika koperasi inti.
 *
 * `interact(spotId)` adalah STATE MACHINE switch/case kedua: ia mengevaluasi
 * lokasi yang dikunjungi + state pemain (S.stage) untuk menentukan dialog yang
 * muncul dan efeknya terhadap state. Di sinilah konsep koperasi diajarkan:
 * Simpanan Pokok/Wajib, pinjam modal, usaha tani, pelunasan, RAT, dan SHU.
 */

import { S, questInfo } from './state.js';
import { rupiah } from './data.js';
import { showDialogue, closeDialogue, advance, refresh, winScreen } from './ui.js';
import { askQuiz } from './quiz.js';
import { showRecap } from './certificate.js';
import * as Audio from './audio.js';

export function interact(spotId){
  const say = (who, text, choices) => showDialogue(who, text, choices);

  switch (spotId){

    /* ----- Kepala Desa: pemicu cerita & pendaftaran ----- */
    case 'kepala':
      if (S.stage === 'INTRO'){
        say('Kepala Desa',
          'Halo, pengembara! Desa kita ingin bangkit lewat KOPERASI, usaha bersama dari, oleh, dan untuk anggota. Mau bergabung dan bantu desa?',
          [{ label:'Ya, saya mau!', go:()=>{ S.stage='JOIN'; Audio.play('advance'); advance(); } }]);
      } else if (S.stage === 'DONE'){
        say('Kepala Desa',
          `Luar biasa, ${S.playerName}! Kamu sudah membuktikan seluruh siklus koperasi — mendaftar, menabung, meminjam modal, bertani, melunasi, dan menerima SHU. Desa kita bangga punya kader sepertimu!`);
      } else {
        say('Kepala Desa', 'Terus semangat, ikuti misimu di pojok kanan!');
      }
      break;

    /* ----- Kantor Koperasi: Simpanan Pokok & Wajib ----- */
    case 'koperasi':
      if (S.stage === 'DONE'){
        say('Kantor Koperasi',
          `Desa makin maju berkat koperasi! Simpananmu: ${rupiah(S.simpananPokok + S.simpananWajib)}. ` +
          `SHU yang kamu terima di RAT: ${rupiah(S.shu)}. Kamu masih bisa menambah Simpanan Wajib kapan saja.`,
          [
            { label:'Setor Rp10.000', cond:S.money>=10000, go:()=>{
              S.money-=10000; S.simpananWajib+=10000; refresh();
              say('Kantor Koperasi','Simpanan Wajib bertambah! Anggota koperasi yang setia.',
                [{ label:'Oke', go:closeDialogue }]);
            }},
            { label:'Lihat Rapor & Sertifikat', go:()=>{ closeDialogue(); showRecap(); } },
            { label:'Tutup', go:closeDialogue },
          ]);
      } else if (S.stage === 'JOIN'){
        say('Kantor Koperasi',
          'Untuk jadi ANGGOTA, kamu bayar SIMPANAN POKOK satu kali: Rp50.000. Ini modal awal bersama koperasi. Bayar sekarang?',
          [
            { label:'Bayar Rp50.000', cond:S.money>=50000, go:()=>{
              S.money-=50000; S.simpananPokok=50000; S.isMember=true; S.stage='LOAN'; Audio.play('advance');
              say('Kantor Koperasi','Selamat! Kamu resmi ANGGOTA koperasi. Simpanan Pokok tercatat sebagai milikmu di koperasi.',
                [{ label:'Mantap!', go:()=> askQuiz('pokok', advance) }]);
            }},
            { label:'Nanti dulu', go:closeDialogue }
          ]);
      } else if (S.isMember){
        say('Kantor Koperasi',
          `Status: ANGGOTA aktif. Simpanan Pokok: ${rupiah(S.simpananPokok)}, Simpanan Wajib: ${rupiah(S.simpananWajib)}. Mau setor Simpanan Wajib Rp10.000?`,
          [
            { label:'Setor Rp10.000', cond:S.money>=10000, go:()=>{
              S.money-=10000; S.simpananWajib+=10000; refresh();
              say('Kantor Koperasi','Simpanan Wajib bertambah! Makin besar simpananmu, makin besar SHU-mu nanti.',
                [{ label:'Oke', go:()=> askQuiz('wajib', closeDialogue) }]);
            }},
            { label:'Tutup', go:closeDialogue }
          ]);
      } else {
        say('Kantor Koperasi','Temui Kepala Desa dulu untuk memulai.');
      }
      break;

    /* ----- Bendahara: pinjaman & pelunasan ----- */
    case 'bendahara':
      if (S.stage === 'LOAN'){
        say('Bendahara',
          'Kamu butuh modal Rp75.000 untuk bertani. Ada dua pilihan:\n\nKOPERASI: kembalikan Rp75.000 saja (jasa ringan, untung balik ke anggota).\nRENTENIR: terima Rp75.000 tapi kembalikan Rp97.500 (bunga 30%!).\n\nPilih yang mana?',
          [
            { label:'Pinjam dari Koperasi (balik Rp75.000)', go:()=>{
              S.money+=75000; S.loan=75000; S.loanType='koperasi'; S.stage='PLANT'; Audio.play('advance');
              say('Bendahara','Pilihan bijak! Dana koperasi cair. Pinjaman koperasi itu amanah bersama, untungnya pun kembali ke kita.',
                [{ label:'Siap!', go:()=> askQuiz('modal', advance) }]);
            }},
            { label:'Pinjam dari Rentenir (balik Rp97.500)', go:()=>{
              say('Peringatan Penting',
                'Yakin memilih rentenir?\n\n' +
                '• Rentenir: kembalikan Rp97.500 (bunga +Rp22.500!)\n' +
                '• Koperasi: kembalikan Rp75.000 saja\n\n' +
                'Bunga 30% akan memangkas untung bertanimu. Pertimbangkan lagi!',
                [
                  { label:'Ya, tetap pilih rentenir', go:()=>{
                    S.money+=75000; S.loan=97500; S.loanType='rentenir'; S.stage='PLANT'; Audio.play('advance');
                    say('Bendahara','Bunga 30% rentenir memangkas keuntunganmu — kamu harus kembalikan Rp97.500. Lain kali, pilih koperasi!',
                      [{ label:'Mengerti...', go:()=> askQuiz('modal', advance) }]);
                  }},
                  { label:'Batal, pilih koperasi', go:()=>{
                    S.money+=75000; S.loan=75000; S.loanType='koperasi'; S.stage='PLANT'; Audio.play('advance');
                    say('Bendahara','Keputusan bijak! Dana koperasi cair. Pinjaman koperasi itu amanah bersama, untungnya pun kembali ke kita.',
                      [{ label:'Siap!', go:()=> askQuiz('modal', advance) }]);
                  }},
                ]);
            }},
          ]);
      } else if (S.stage === 'REPAY'){
        if (S.money >= S.loan){
          say('Bendahara',
            `Saatnya lunasi pinjaman: ${rupiah(S.loan)}. Saldomu ${rupiah(S.money)}. Lunasi sekarang?`,
            [{ label:`Lunasi ${rupiah(S.loan)}`, go:()=>{
              S.money-=S.loan; S.loan=0; S.stage='RAT'; Audio.play('advance');
              say('Bendahara','Lunas! Kamu anggota yang bertanggung jawab. Sekarang hadiri RAT di Balai Desa.',
                [{ label:'Menuju RAT', go:advance }]);
            }}]);
        } else {
          say('Bendahara',`Saldomu belum cukup untuk lunasi ${rupiah(S.loan)}. Jual lebih banyak panen dulu di Pasar.`);
        }
      } else if (S.stage === 'DONE'){
        say('Bendahara',
          `Akun pinjaman bersih. Kamu membuktikan: koperasi adalah mitra terpercaya, bukan rentenir yang mencekik. Terima kasih telah menjadi anggota yang bertanggung jawab, ${S.playerName}!`);
      } else {
        say('Bendahara','Belum ada urusan pinjaman saat ini.');
      }
      break;

    /* ----- Ladang: beli bibit & panen ----- */
    case 'ladang':
      if (S.stage === 'PLANT'){
        say('Ladang',
          'Beli bibit Rp60.000 lalu tanam. Setelah ditanam, panen langsung tumbuh (versi demo dipercepat).',
          [{ label:'Beli & Tanam (Rp60.000)', cond:S.money>=60000, go:()=>{
            S.money-=60000; S.seeds=0; S.harvest=10; S.rounds++; S.stage='SELL'; Audio.play('advance');
            say('Ladang','Panen melimpah! Kamu dapat 10 hasil panen. Bawa ke Pasar untuk dijual.',
              [{ label:'Ke Pasar', go:advance }]);
          }}]);
      } else if (S.isMember){
        say('Ladang',
          'Mau tanam lagi? Beli bibit Rp60.000 untuk 10 panen.',
          [
            { label:'Tanam (Rp60.000)', cond:S.money>=60000, go:()=>{
              S.money-=60000; S.harvest+=10; S.rounds++;
              say('Ladang','Panen baru siap! Jual di Pasar.',[{ label:'Oke', go:closeDialogue }]);
              refresh();
            }},
            { label:'Tutup', go:closeDialogue }
          ]);
      } else {
        say('Ladang','Jadi anggota koperasi dulu untuk akses modal tani.');
      }
      break;

    /* ----- Pasar: jual panen ----- */
    case 'pasar':
      if (S.harvest > 0){
        const earn = S.harvest * 15000;
        say('Pasar',
          `Pembeli siap! ${S.harvest} panen × Rp15.000 = ${rupiah(earn)}. Jual semua?`,
          [{ label:`Jual (${rupiah(earn)})`, go:()=>{
            S.money += earn; S.harvest = 0;
            if (S.stage === 'SELL'){ S.stage = 'REPAY'; Audio.play('advance'); }
            say('Pasar','Laku semua! Untungmu bisa dipakai melunasi pinjaman koperasi.',
              [{ label:'Lanjut', go:advance }]);
          }}]);
      } else {
        say('Pasar','Belum ada panen untuk dijual. Tanam dulu di Ladang.');
      }
      break;

    /* ----- Sumur Desa: flavor / gotong royong ----- */
    case 'well':
      say('Sumur Desa',
        'Sumur ini jantung desa — warga bergotong royong membangunnya bersama.' +
        ' Air bersih untuk semua, tanpa terkecuali. Inilah semangat koperasi: dari kita, oleh kita, untuk kita!');
      break;

    /* ----- Balai Desa: RAT & pembagian SHU ----- */
    case 'balai':
      if (S.stage === 'RAT'){
        // SHU = jasa modal (dari simpanan) + jasa usaha (dari transaksi/keaktifan)
        const jasaModal = Math.round((S.simpananPokok + S.simpananWajib) * 0.4);
        const jasaUsaha = S.rounds * 8000;
        S.shu = jasaModal + jasaUsaha;
        S.money += S.shu;
        S.stage = 'DONE';
        say('Balai Desa (RAT)',
          `RAPAT ANGGOTA TAHUNAN, koperasi untung tahun ini! SHU-mu dihitung adil:\n\n` +
          `• Jasa Modal (40% dari simpananmu ${rupiah(S.simpananPokok + S.simpananWajib)}) = ${rupiah(jasaModal)}\n` +
          `• Jasa Usaha (keaktifanmu, ${S.rounds}× panen) = ${rupiah(jasaUsaha)}\n` +
          `--------------\n` +
          `TOTAL SHU = ${rupiah(S.shu)}\n\n` +
          `Inilah inti koperasi: makin aktif & banyak menabung, makin besar bagianmu. Untung dinikmati bersama!`,
          [{ label:'Terima SHU!', go:()=> askQuiz('shu', ()=>{ advance(); winScreen(); }) }]);
      } else if (S.stage === 'DONE'){
        say('Balai Desa','RAT tahun ini sudah selesai. Terima kasih sudah belajar koperasi, Wanderer!');
      } else {
        say('Balai Desa',
          'Rapat Anggota Tahunan (RAT) adalah rapat tertinggi koperasi. Setiap anggota punya satu suara, apapun besar simpanannya. Ingin pelajari lebih lanjut?',
          [
            { label:'Pelajari RAT', go:()=> askQuiz('rat', closeDialogue) },
            { label:'Tutup', go:closeDialogue },
          ]);
      }
      break;
  }

  refresh();
}
