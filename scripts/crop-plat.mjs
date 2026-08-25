import sharp from 'sharp';
const [,, src, dst, l, t, w, h] = process.argv;
const img = sharp(src, { limitInputPixels: false });
const meta = await img.metadata();
const region = {
  left: Math.round(meta.width * Number(l)),
  top: Math.round(meta.height * Number(t)),
  width: Math.round(meta.width * Number(w)),
  height: Math.round(meta.height * Number(h)),
};
await sharp(src, { limitInputPixels: false }).extract(region)
  .resize({ width: 2400, withoutEnlargement: true })
  .png({ compressionLevel: 9 }).toFile(dst);
console.log('cropped', JSON.stringify(region));
