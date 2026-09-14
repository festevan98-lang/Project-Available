import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cnNzdHp0ZmNpcmhmZGtqYWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjY1OTAsImV4cCI6MjA4MDkwMjU5MH0.BzFgmyg8Ivy3CTXRtOnp3EgaP6Y4d9sY2eoTg9n0VV4';
const outDir = process.argv[2];

const rows = await fetch('https://ptrsstztfcirhfdkjabi.supabase.co/rest/v1/public_plat_maps?select=lots,image_url,updated_at&id=eq.a6ef6429-7e02-4efc-a2d7-0ba73d04a62f', { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } }).then(r => r.json());
const row = rows[0];
const lots = (typeof row.lots === 'string' ? JSON.parse(row.lots) : row.lots).map(l => ({
  n: parseInt(l.lotNumber.replace(/\D/g, '')),
  sqft: parseInt((l.size || '').replace(/\D/g, '')) || 0,
  price: parseFloat((l.price || '').replace(/[^0-9.]/g, '')) || 0,
  status: l.status,
  shape: l.shapeType,
  pts: l.points || [],
}));
const avail = lots.filter(l => l.status === 'available');
const sold = lots.filter(l => l.status === 'sold');
console.log('updated:', row.updated_at);
console.log('counts:', avail.length, 'available /', sold.length, 'sold /', lots.length, 'total');
console.log('avail price range:', Math.min(...avail.map(l => l.price)), '-', Math.max(...avail.map(l => l.price)));
console.log('avail sqft range:', Math.min(...avail.map(l => l.sqft)), '-', Math.max(...avail.map(l => l.sqft)));

// render branded availability map: plat image + green/red shapes
const imgBuf = Buffer.from(await fetch(row.image_url).then(r => r.arrayBuffer()));
const meta = await sharp(imgBuf).metadata();
const W = 1600, H = Math.round(meta.height * (1600 / meta.width));
const base64 = (await sharp(imgBuf).resize({ width: W }).jpeg({ quality: 80 }).toBuffer()).toString('base64');
const GREEN = 'hsl(142,71%,45%)', RED = 'hsl(0,84%,60%)';
const shapes = lots.filter(l => l.pts.length >= 2 && l.n !== 141 && l.n !== 142).map(l => {
  const fill = l.status === 'available' ? GREEN : RED;
  const stroke = l.status === 'available' ? 'hsl(142,71%,30%)' : 'hsl(0,84%,42%)';
  if (l.shape === 'rectangle' || l.pts.length === 2) {
    const xs = l.pts.map(p => p.x * W), ys = l.pts.map(p => p.y * H);
    const x = Math.min(...xs), y = Math.min(...ys);
    return `<rect x="${x}" y="${y}" width="${Math.max(...xs) - x}" height="${Math.max(...ys) - y}" fill="${fill}" fill-opacity="0.48" stroke="${stroke}" stroke-width="2"/>`;
  }
  return `<polygon points="${l.pts.map(p => `${p.x * W},${p.y * H}`).join(' ')}" fill="${fill}" fill-opacity="0.48" stroke="${stroke}" stroke-width="2"/>`;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><image href="data:image/jpeg;base64,${base64}" width="${W}" height="${H}"/>${shapes}</svg>`;
await sharp(Buffer.from(svg), { limitInputPixels: false }).resize({ width: 940 }).jpeg({ quality: 66 }).toFile(outDir + '/livemap.jpg');
const { statSync } = await import('node:fs');
console.log('livemap.jpg', (statSync(outDir + '/livemap.jpg').size / 1024).toFixed(0) + 'KB', 'aspect', (W / H).toFixed(3));
writeFileSync(outDir + '/live.json', JSON.stringify({ updated: row.updated_at, available: avail.length, sold: sold.length, total: lots.length }));
