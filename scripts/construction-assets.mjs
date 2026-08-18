import { mkdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const ROOT = 'C:/Users/Fernando/Desktop/DESKTOP CLAUDE WORK/FEREST Project Website';
mkdirSync('public/models', { recursive: true });
mkdirSync('public/construction', { recursive: true });

// [source, outPath, maxWidth]
const JOBS = [
  // Model home (Lot 64 Laguna Oaks) -> Block 1 "The Home We Build"
  [`${ROOT}/Construction Projects/Lot 64 Laguna Oaks/Lot 64 Draft 4.jpg`, 'public/models/ferest-model-ext-1.webp', 1600],
  [`${ROOT}/Construction Projects/Lot 64 Laguna Oaks/Lot 64 Draft 1.jpg`, 'public/models/ferest-model-ext-2.webp', 1600],
  [`${ROOT}/Construction Projects/Lot 64 Laguna Oaks/Lot 64 Draft 3.jpg`, 'public/models/ferest-model-ext-3.webp', 1600],
  [`${ROOT}/Construction Projects/Lot 64 Laguna Oaks/ferest_ds_AMEND_Interior_V (1).jpg`, 'public/models/ferest-model-kitchen.webp', 1600],
  [`${ROOT}/Construction Projects/Lot 64 Laguna Oaks/ferest_ds_AMEND_Interior_V (2).jpg`, 'public/models/ferest-model-living.webp', 1600],
  // Built by FEREST -> Track Record gallery
  [`${ROOT}/Construction Projects/Lot 77 Garden Path/Lot 77-Draft 1.jpg`, 'public/construction/lot77-garden-path.webp', 1400],
  [`${ROOT}/Construction Projects/Luma Cocktail Bar/FDS_LUMA 1.PNG`, 'public/construction/luma.webp', 1400],
  [`${ROOT}/Construction Projects/Mil Besos Cocktail Bar/IMG_6097.JPG`, 'public/construction/mil-besos.webp', 1400],
];

for (const [src, out, w] of JOBS) {
  const buf = await readFile(src);
  const meta = await sharp(buf).metadata();
  const outBuf = await sharp(buf)
    .rotate()
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
  await writeFile(out, outBuf);
  console.log(`${out.padEnd(46)} ${(outBuf.length / 1024).toFixed(0).padStart(5)} KB  (src ${meta.width}x${meta.height})`);
}
console.log('\nDone.');
