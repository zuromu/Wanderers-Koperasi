/**
 * scene.js — Scene Phaser: menggambar peta, NPC, dan pemain; menangani
 * gerakan, tabrakan, dan input interaksi (Spasi).
 */

import { TILE, COLS, ROWS, MAP, SPOTS } from './data.js';
import { questInfo } from './state.js';
import { interact } from './quest.js';
import { isDialogueOpen, advanceDialogue, refresh, setSceneRef, showDialogue } from './ui.js';

export class Village extends Phaser.Scene {
  constructor(){ super('Village'); }

  create(){
    setSceneRef(this);

    // Gambar peta
    const colors = { 0:0x6abf69, 1:0xc9b079, 2:0x3b6ea5 };
    for (let r=0; r<ROWS; r++){
      for (let c=0; c<COLS; c++){
        const t = +MAP[r][c];
        this.add.rectangle(c*TILE+TILE/2, r*TILE+TILE/2, TILE-1, TILE-1, colors[t])
            .setStrokeStyle(1, 0x000000, .06);
      }
    }

    // Gambar bangunan / NPC
    SPOTS.forEach(s => {
      this.add.rectangle(s.x*TILE+TILE/2, s.y*TILE+TILE/2, TILE-2, TILE-2, 0xfffaf0)
          .setAlpha(.9).setStrokeStyle(2, 0x1d2230);
      this.add.text(s.x*TILE+TILE/2, s.y*TILE+TILE/2, s.emoji, { fontSize:'24px' }).setOrigin(.5);
      this.add.text(s.x*TILE+TILE/2, s.y*TILE+TILE/2+22, s.name,
          { fontSize:'9px', color:'#1d2230', fontStyle:'bold' }).setOrigin(.5);
    });

    // Pemain (posisi dalam petak grid)
    this.px = 10; this.py = 11;
    this.player = this.add.text(0, 0, '🧍', { fontSize:'28px' }).setOrigin(.5);

    // Penanda tujuan (dibuat sebelum placePlayer agar updateMarker aman)
    this.marker = this.add.rectangle(0, 0, TILE, TILE).setStrokeStyle(3, 0xe0a52b).setVisible(false);
    this.placePlayer();

    // Input
    this.input.keyboard.on('keydown', e => {
      if (isDialogueOpen()){
        if (e.code === 'Space') advanceDialogue();
        return;
      }
      let nx = this.px, ny = this.py;
      if      (e.code==='ArrowLeft'  || e.code==='KeyA') nx--;
      else if (e.code==='ArrowRight' || e.code==='KeyD') nx++;
      else if (e.code==='ArrowUp'    || e.code==='KeyW') ny--;
      else if (e.code==='ArrowDown'  || e.code==='KeyS') ny++;
      else if (e.code==='Space'){ this.tryInteract(); return; }
      else return;

      // Tabrakan: tidak boleh ke air (2) atau keluar peta
      if (nx<0 || ny<0 || nx>=COLS || ny>=ROWS) return;
      if (+MAP[ny][nx] === 2) return;
      this.px = nx; this.py = ny; this.placePlayer();
    });

    refresh();
  }

  placePlayer(){
    this.player.setPosition(this.px*TILE+TILE/2, this.py*TILE+TILE/2);
    this.updateMarker();
  }

  updateMarker(){
    if (!this.marker) return;
    const q = questInfo();
    const t = SPOTS.find(s => s.id === q.target);
    if (t) this.marker.setPosition(t.x*TILE+TILE/2, t.y*TILE+TILE/2).setVisible(true);
    else   this.marker.setVisible(false);
  }

  tryInteract(){
    // Cari spot bertetangga (jarak grid <= 1 di kedua sumbu)
    const near = SPOTS.find(s => Math.abs(s.x-this.px)<=1 && Math.abs(s.y-this.py)<=1);
    if (near) interact(near.id);
    else showDialogue('Wanderer','Tidak ada siapa-siapa di sini. Dekati gedung bertanda lalu tekan Spasi.');
  }
}
