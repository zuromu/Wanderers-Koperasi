/**
 * palette.js, Palet warna kohesif (cozy stylized) untuk seluruh game.
 * Aturan: semua warna sedikit didesaturasi, cahaya hangat + bayangan dingin.
 */
export const C = {
  grass:      0x77b86b,
  grassShade: 0x5f9a57,
  grassHi:    0x9ad086,
  path:       0xd8b878,
  pathShade:  0xbb9858,
  water:      0x5ba3c7,
  waterHi:    0x8fd0e8,
  panel:      0x1c1926,
  ink:        0xf2e9d8,
  gold:       0xe8a33d,   // aksen utama (koperasi)
  coral:      0xd96c6c,   // aksen sekunder
  success:    0x7fc96b,
  shadow:     0x14101c,
};

/** Versi string CSS untuk dipakai di DOM. */
export const CSS = {
  panel:  'rgba(28,25,38,.86)',
  ink:    '#f2e9d8',
  gold:   '#e8a33d',
  coral:  '#d96c6c',
  success:'#7fc96b',
  shadow: '#14101c',
};
