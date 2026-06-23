/**
 * main.js — Titik masuk: konfigurasi & boot Phaser.
 * Phaser dimuat sebagai global lewat <script> CDN di index.html.
 */

import { W, H } from './data.js';
import { Village } from './scene.js';
import { S, questInfo, resetState } from './state.js';
import { interact, } from './quest.js';
import { refresh } from './ui.js';

const config = {
  type: Phaser.CANVAS,        // CANVAS = render stabil di semua perangkat & screenshot
  width: W,
  height: H,
  parent: 'game',
  backgroundColor: '#000',
  pixelArt: false,
  scene: [Village],
};

const game = new Phaser.Game(config);

// Handle debug opsional (berguna untuk pengetesan di konsol browser).
window.WKQ = { game, S, questInfo, interact, refresh, resetState };
