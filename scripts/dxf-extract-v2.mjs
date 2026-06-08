import { readFileSync, writeFileSync } from 'node:fs';
import DxfParser from 'dxf-parser';

const file = process.argv[2];
const outDir = process.argv[3] ?? 'public/plats';
const slug = process.argv[4] ?? 'plat';

if (!file) {
  console.error('usage: node dxf-extract-v2.mjs <dxf> [outDir] [slug]');
  process.exit(1);
}

const text = readFileSync(file, 'utf8');
const dxf = new DxfParser().parseSync(text);

const lotLines = [];
const allByLayer = new Map();

function bumpLayer(layer, seg) {
  if (!allByLayer.has(layer)) allByLayer.set(layer, []);
  allByLayer.get(layer).push(seg);
}

for (const e of dxf.entities) {
  if (e.type === 'LINE') {
    const seg = {
      x1: e.vertices[0].x, y1: e.vertices[0].y,
      x2: e.vertices[1].x, y2: e.vertices[1].y,
    };
    bumpLayer(e.layer, seg);
    if (e.layer === 'C-PROP-LINE - SUB LOTS') lotLines.push(seg);
  } else if (e.type === 'ARC') {
    const cx = e.center.x, cy = e.center.y, r = e.radius;
    const a0 = (e.startAngle * Math.PI) / 180;
    let a1 = (e.endAngle * Math.PI) / 180;
    while (a1 < a0) a1 += Math.PI * 2;
    const sweep = a1 - a0;
    const steps = Math.max(8, Math.ceil((sweep / (Math.PI * 2)) * 64));
    let prev = { x: cx + r * Math.cos(a0), y: cy + r * Math.sin(a0) };
    for (let i = 1; i <= steps; i++) {
      const t = a0 + (sweep * i) / steps;
      const next = { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
      bumpLayer(e.layer, { x1: prev.x, y1: prev.y, x2: next.x, y2: next.y });
      prev = next;
    }
  } else if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
    if (!e.vertices || e.vertices.length < 2) continue;
    for (let i = 0; i < e.vertices.length - 1; i++) {
      bumpLayer(e.layer, {
        x1: e.vertices[i].x, y1: e.vertices[i].y,
        x2: e.vertices[i+1].x, y2: e.vertices[i+1].y,
      });
    }
  }
}

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const s of lotLines) {
  minX = Math.min(minX, s.x1, s.x2);
  minY = Math.min(minY, s.y1, s.y2);
  maxX = Math.max(maxX, s.x1, s.x2);
  maxY = Math.max(maxY, s.y1, s.y2);
}
const padX = (maxX - minX) * 0.04;
const padY = (maxY - minY) * 0.04;
const clipMinX = minX - padX, clipMinY = minY - padY;
const clipMaxX = maxX + padX, clipMaxY = maxY + padY;
const clipW = clipMaxX - clipMinX;
const clipH = clipMaxY - clipMinY;

console.log(`Lot bbox: ${(maxX - minX).toFixed(0)} × ${(maxY - minY).toFixed(0)} ft`);
console.log(`Lot side lines: ${lotLines.length}`);

function lineProps(seg) {
  const dx = seg.x2 - seg.x1;
  const dy = seg.y2 - seg.y1;
  const len = Math.hypot(dx, dy);
  let theta = Math.atan2(dy, dx);
  if (theta < 0) theta += Math.PI;
  if (theta >= Math.PI - 1e-6) theta -= Math.PI;
  return { dx, dy, len, theta, midX: (seg.x1 + seg.x2) / 2, midY: (seg.y1 + seg.y2) / 2 };
}

const enriched = lotLines
  .map(s => ({ s, p: lineProps(s) }))
  .filter(e => e.p.len > 20 && e.p.len < 400);
console.log(`After length filter (20-400 ft): ${enriched.length}`);

const ANGLE_TOL = (3 * Math.PI) / 180;
const orientationGroups = [];
for (const e of enriched) {
  let g = orientationGroups.find(group =>
    Math.abs(group.theta - e.p.theta) < ANGLE_TOL ||
    Math.abs(group.theta - e.p.theta - Math.PI) < ANGLE_TOL ||
    Math.abs(group.theta - e.p.theta + Math.PI) < ANGLE_TOL
  );
  if (!g) {
    g = { theta: e.p.theta, lines: [] };
    orientationGroups.push(g);
  }
  g.lines.push(e);
}
orientationGroups.sort((a, b) => b.lines.length - a.lines.length);

console.log(`\nOrientation groups (top 10):`);
for (const g of orientationGroups.slice(0, 10)) {
  const deg = (g.theta * 180) / Math.PI;
  console.log(`  θ ≈ ${deg.toFixed(1)}°  count=${g.lines.length}`);
}

function clusterRows(group) {
  const lines = group.lines;
  const dirX = Math.cos(group.theta), dirY = Math.sin(group.theta);
  const perpX = -dirY, perpY = dirX;
  const sLine = lines.map(e => {
    const t0 = e.s.x1 * dirX + e.s.y1 * dirY;
    const t1 = e.s.x2 * dirX + e.s.y2 * dirY;
    const tMid = (t0 + t1) / 2;
    const u = (e.s.x1 + e.s.x2) / 2 * perpX + (e.s.y1 + e.s.y2) / 2 * perpY;
    return { e, t0: Math.min(t0, t1), t1: Math.max(t0, t1), tMid, u };
  });
  sLine.sort((a, b) => a.tMid - b.tMid);
  const rows = [];
  const ROW_GAP = Math.min(clipW, clipH) * 0.04;
  for (const ln of sLine) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(ln.tMid - last.lines[last.lines.length - 1].tMid) < ROW_GAP) {
      last.lines.push(ln);
    } else {
      rows.push({ lines: [ln] });
    }
  }
  for (const r of rows) {
    r.lines.sort((a, b) => a.u - b.u);
  }
  return { rows, dirX, dirY, perpX, perpY };
}

function quadFromPair(a, b) {
  return [
    { x: a.e.s.x1, y: a.e.s.y1 },
    { x: a.e.s.x2, y: a.e.s.y2 },
    { x: b.e.s.x2, y: b.e.s.y2 },
    { x: b.e.s.x1, y: b.e.s.y1 },
  ];
}
function orderQuad(quad) {
  const cx = quad.reduce((s, p) => s + p.x, 0) / 4;
  const cy = quad.reduce((s, p) => s + p.y, 0) / 4;
  return [...quad].sort((p, q) => Math.atan2(p.y - cy, p.x - cx) - Math.atan2(q.y - cy, q.x - cx));
}
function quadArea(quad) {
  let a = 0;
  for (let i = 0; i < 4; i++) {
    const p = quad[i], q = quad[(i + 1) % 4];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a / 2);
}

const allLots = [];
let lotIdx = 0;
for (const group of orientationGroups) {
  if (group.lines.length < 4) continue;
  const { rows } = clusterRows(group);
  for (const row of rows) {
    if (row.lines.length < 2) continue;
    for (let i = 0; i < row.lines.length - 1; i++) {
      const a = row.lines[i], b = row.lines[i + 1];
      const gap = Math.abs(b.u - a.u);
      if (gap < 8 || gap > 250) continue;
      const overlapA = Math.max(0, Math.min(a.t1, b.t1) - Math.max(a.t0, b.t0));
      const minSpan = Math.min(a.t1 - a.t0, b.t1 - b.t0);
      if (overlapA < minSpan * 0.4) continue;
      const quad = orderQuad(quadFromPair(a, b));
      const area = quadArea(quad);
      if (area < 1500 || area > 60000) continue;
      lotIdx++;
      allLots.push({
        lot_number: String(lotIdx),
        polygon_world: quad,
        size_sqft: Math.round(area),
        orient_deg: ((group.theta * 180) / Math.PI).toFixed(1),
      });
    }
  }
}

allLots.sort((a, b) => {
  const ay = a.polygon_world.reduce((s, p) => s + p.y, 0) / 4;
  const by = b.polygon_world.reduce((s, p) => s + p.y, 0) / 4;
  if (Math.abs(ay - by) > 50) return by - ay;
  const ax = a.polygon_world.reduce((s, p) => s + p.x, 0) / 4;
  const bx = b.polygon_world.reduce((s, p) => s + p.x, 0) / 4;
  return ax - bx;
});
allLots.forEach((l, i) => l.lot_number = String(i + 1));

console.log(`\n✓ Detected lots: ${allLots.length}`);
if (allLots.length) {
  const sizes = allLots.map(l => l.size_sqft).sort((a, b) => a - b);
  const median = sizes[Math.floor(sizes.length / 2)];
  console.log(`  size range: ${sizes[0]} → ${sizes[sizes.length - 1]} sq ft`);
  console.log(`  median: ${median} sq ft`);
}

const VIEW_W = 1600;
const VIEW_H = Math.round(VIEW_W * (clipH / clipW));
const tx = (x) => ((x - clipMinX) / clipW) * VIEW_W;
const ty = (y) => VIEW_H - ((y - clipMinY) / clipH) * VIEW_H;
console.log(`SVG viewport: ${VIEW_W} × ${VIEW_H}`);

function inClip(x, y) {
  return x >= clipMinX && x <= clipMaxX && y >= clipMinY && y <= clipMaxY;
}

const colors = {
  'C-PROP-LINE - SUB LOTS': '#d9a437',
  'PROP CENTER LINE': '#52503f',
  'PROP. UTILITY EASEMENT': '#785420',
  'PROP_PAVING': '#3d2c15',
};
const widths = {
  'C-PROP-LINE - SUB LOTS': 1.0,
  'PROP CENTER LINE': 0.5,
  'PROP. UTILITY EASEMENT': 0.4,
  'PROP_PAVING': 0.6,
};
const dashes = { 'PROP CENTER LINE': '5,5', 'PROP. UTILITY EASEMENT': '2,3' };

const layerSvgs = [];
for (const layer of ['PROP_PAVING', 'PROP. UTILITY EASEMENT', 'PROP CENTER LINE', 'C-PROP-LINE - SUB LOTS']) {
  const segs = (allByLayer.get(layer) ?? []).filter(s => inClip(s.x1, s.y1) || inClip(s.x2, s.y2));
  if (!segs.length) continue;
  const lines = segs.map(s =>
    `<line x1="${tx(s.x1).toFixed(1)}" y1="${ty(s.y1).toFixed(1)}" x2="${tx(s.x2).toFixed(1)}" y2="${ty(s.y2).toFixed(1)}"/>`
  ).join('');
  const dash = dashes[layer] ? ` stroke-dasharray="${dashes[layer]}"` : '';
  layerSvgs.push(`<g stroke="${colors[layer]}" stroke-width="${widths[layer]}" fill="none"${dash}>${lines}</g>`);
}

const lotsForOutput = allLots.map(l => {
  const pts = l.polygon_world.map(p => ({ x: tx(p.x), y: ty(p.y) }));
  return {
    lot_number: l.lot_number,
    polygon_points: pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
    size_sqft: l.size_sqft,
  };
});

const debugPolys = lotsForOutput.map(l =>
  `<polygon points="${l.polygon_points}" fill="rgba(217,164,55,0.18)" stroke="#d9a437" stroke-width="0.6"/>`
).join('');
const debugNumbers = lotsForOutput.map(l => {
  const pts = l.polygon_points.split(' ').map(p => p.split(',').map(Number));
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#0d0c08" font-weight="600">${l.lot_number}</text>`;
}).join('');

const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet">
<rect width="100%" height="100%" fill="#100f0d"/>
${layerSvgs.join('\n')}
</svg>`;

const debugSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet">
<rect width="100%" height="100%" fill="#100f0d"/>
${layerSvgs.join('\n')}
<g>${debugPolys}</g>
<g>${debugNumbers}</g>
</svg>`;

writeFileSync(`${outDir}/${slug}-plat.svg`, cleanSvg);
writeFileSync(`${outDir}/${slug}-plat-debug.svg`, debugSvg);
writeFileSync(`${outDir}/${slug}-lots.json`, JSON.stringify({
  viewport: { width: VIEW_W, height: VIEW_H },
  source_extent: { minX: clipMinX, minY: clipMinY, maxX: clipMaxX, maxY: clipMaxY },
  lots: lotsForOutput,
}, null, 2));

console.log(`\n✓ ${outDir}/${slug}-plat.svg`);
console.log(`✓ ${outDir}/${slug}-plat-debug.svg  (overlay: numbered detected lots over plat)`);
console.log(`✓ ${outDir}/${slug}-lots.json  (${lotsForOutput.length} lots)`);
