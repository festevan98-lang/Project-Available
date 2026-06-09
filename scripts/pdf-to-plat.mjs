import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import sharp from 'sharp';

const [, , src, dst, scaleStr] = process.argv;
if (!src || !dst) {
  console.error('usage: node pdf-to-plat.mjs <pdf> <dst.png> [scale=3]');
  process.exit(1);
}
const scale = Number(scaleStr) || 3;

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

const srcStat = statSync(src);
console.log(`Source PDF: ${(srcStat.size / 1024 / 1024).toFixed(1)} MB`);

const data = new Uint8Array(readFileSync(src));
const cmapBase = pathToFileURL(
  path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'cmaps') + path.sep
).href;
const standardFontBase = pathToFileURL(
  path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'standard_fonts') + path.sep
).href;

const loadingTask = pdfjs.getDocument({
  data,
  cMapUrl: cmapBase,
  cMapPacked: true,
  standardFontDataUrl: standardFontBase,
});
const pdf = await loadingTask.promise;
console.log(`Pages: ${pdf.numPages}`);

const page = await pdf.getPage(1);
const viewport = page.getViewport({ scale });
console.log(`Rendering at scale ${scale}: ${Math.round(viewport.width)} x ${Math.round(viewport.height)}`);

const canvas = createCanvas(viewport.width, viewport.height);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, viewport.width, viewport.height);

await page.render({ canvasContext: ctx, viewport }).promise;
const rawBuffer = canvas.toBuffer('image/png');
console.log(`Raw render: ${(rawBuffer.length / 1024 / 1024).toFixed(2)} MB`);

// Trim margins (a plat is usually centered with whitespace around it)
// and resize to a sensible web width
const targetWidth = Math.min(3200, Math.round(viewport.width));
await sharp(rawBuffer, { limitInputPixels: false })
  .resize({ width: targetWidth, withoutEnlargement: true })
  .png({ compressionLevel: 9, quality: 92 })
  .toFile(dst);

const dstStat = statSync(dst);
console.log(`Wrote ${dst}: ${(dstStat.size / 1024 / 1024).toFixed(2)} MB`);
