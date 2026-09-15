// Render a PDF page to PNG via MuPDF (handles JBIG2 county scans pdfjs cannot).
import * as fs from 'node:fs';
import * as mupdf from 'mupdf';
import sharp from 'sharp';

const [, , src, dst, pageStr, scaleStr] = process.argv;
const pageNum = (Number(pageStr) || 1) - 1;
const scale = Number(scaleStr) || 2;
const doc = mupdf.Document.openDocument(fs.readFileSync(src), 'application/pdf');
const page = doc.loadPage(pageNum);
const pix = page.toPixmap(mupdf.Matrix.scale(scale, scale), mupdf.ColorSpace.DeviceRGB, false, true);
const raw = Buffer.from(pix.asPNG());
await sharp(raw, { limitInputPixels: false })
  .resize({ width: 3200, withoutEnlargement: true })
  .png({ compressionLevel: 9 }).toFile(dst);
console.log(`page ${pageNum + 1}/${doc.countPages()} -> ${dst} (${(fs.statSync(dst).size / 1024).toFixed(0)} KB)`);
