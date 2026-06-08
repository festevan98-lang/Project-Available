import sharp from 'sharp';
import { stat } from 'node:fs/promises';

const [, , src, dst, widthStr] = process.argv;
if (!src || !dst) {
  console.error('usage: node resize-hero.mjs <src> <dst> [width=2400]');
  process.exit(1);
}
const width = Number(widthStr) || 2400;

const srcInfo = await stat(src);
console.log(`Source: ${(srcInfo.size / 1024 / 1024).toFixed(1)} MB`);

await sharp(src, { limitInputPixels: false })
  .resize({ width, withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(dst);

const dstInfo = await stat(dst);
console.log(`Wrote ${dst}: ${(dstInfo.size / 1024 / 1024).toFixed(2)} MB`);
