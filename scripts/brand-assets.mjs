import { mkdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { statSync } from 'node:fs';
import sharp from 'sharp';

const SRC = 'C:/Users/Fernando/Downloads/FEREST_Banner_v2/canva_assets';
const OUT = 'public/brand';
mkdirSync(OUT, { recursive: true });

// name -> { src, maxDim (longest edge), fit }
const JOBS = [
  { src: 'FEREST_mark.png',     out: 'ferest-mark.webp',     w: 160, h: 160 },
  { src: 'FEREST_wordmark.png', out: 'ferest-wordmark.webp', w: 520, h: 200 },
  { src: 'M2_logo.png',         out: 'm2-logo.webp',         w: 320, h: 200 },
  { src: 'icon_tiktok.png',     out: 'icon-tiktok.webp',     w: 64,  h: 64 },
  { src: 'icon_instagram.png',  out: 'icon-instagram.webp',  w: 64,  h: 64 },
  { src: 'icon_facebook.png',   out: 'icon-facebook.webp',   w: 64,  h: 64 },
];

for (const job of JOBS) {
  const buf = await readFile(`${SRC}/${job.src}`);
  const meta = await sharp(buf).metadata();
  // Try descending quality until under 20KB.
  let quality = 90;
  let out;
  for (; quality >= 40; quality -= 6) {
    out = await sharp(buf)
      .resize({ width: job.w, height: job.h, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 6, alphaQuality: 90 })
      .toBuffer();
    if (out.length <= 20 * 1024) break;
  }
  await writeFile(`${OUT}/${job.out}`, out);
  console.log(
    `${job.out.padEnd(22)} ${String((out.length / 1024).toFixed(1)).padStart(6)} KB` +
    `  q=${quality}  (src ${meta.width}x${meta.height})`
  );
}
console.log('\nDone. Assets in public/brand/');
