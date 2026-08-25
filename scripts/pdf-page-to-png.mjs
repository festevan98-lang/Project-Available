import { readFileSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import sharp from 'sharp';

const [, , src, dst, pageStr, scaleStr] = process.argv;
const pageNum = Number(pageStr) || 1;
const scale = Number(scaleStr) || 1;
const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
const data = new Uint8Array(readFileSync(src));
const cmapBase = pathToFileURL(path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'cmaps') + path.sep).href;
const fontBase = pathToFileURL(path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'standard_fonts') + path.sep).href;
const pdf = await (pdfjs.getDocument({ data, cMapUrl: cmapBase, cMapPacked: true, standardFontDataUrl: fontBase })).promise;
const page = await pdf.getPage(pageNum);
const viewport = page.getViewport({ scale });
const canvas = createCanvas(viewport.width, viewport.height);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white'; ctx.fillRect(0, 0, viewport.width, viewport.height);
await page.render({ canvasContext: ctx, viewport }).promise;
await sharp(canvas.toBuffer('image/png'), { limitInputPixels: false })
  .resize({ width: Math.min(3200, Math.round(viewport.width)), withoutEnlargement: true })
  .png({ compressionLevel: 9 }).toFile(dst);
console.log(`page ${pageNum}/${pdf.numPages} -> ${dst} (${(statSync(dst).size/1024).toFixed(0)} KB)`);
