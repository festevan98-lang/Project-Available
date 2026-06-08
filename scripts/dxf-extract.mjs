import { readFileSync, writeFileSync } from 'node:fs';
import DxfParser from 'dxf-parser';

const file = process.argv[2];
const outDir = process.argv[3] ?? 'public/plats';
const slug = process.argv[4] ?? 'plat';

if (!file) {
  console.error('usage: node dxf-extract.mjs <dxf> [outDir] [slug]');
  process.exit(1);
}

const text = readFileSync(file, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

const LOT_LAYERS = new Set(['C-PROP-LINE - SUB LOTS']);
const STREET_LAYERS = new Set(['PROP CENTER LINE', 'PROP_PAVING']);
const EASEMENT_LAYERS = new Set(['PROP. UTILITY EASEMENT']);
const ALL_GEOMETRY_LAYERS = new Set([...LOT_LAYERS, ...STREET_LAYERS, ...EASEMENT_LAYERS]);

const linesByLayer = new Map();
const textsAll = [];

function addSeg(layer, x1, y1, x2, y2) {
  if (!linesByLayer.has(layer)) linesByLayer.set(layer, []);
  linesByLayer.get(layer).push({ x1, y1, x2, y2 });
}

function explodeArc(layer, e) {
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
    addSeg(layer, prev.x, prev.y, next.x, next.y);
    prev = next;
  }
}

for (const e of dxf.entities) {
  if (e.type === 'LINE') {
    addSeg(e.layer, e.vertices[0].x, e.vertices[0].y, e.vertices[1].x, e.vertices[1].y);
  } else if (e.type === 'ARC') {
    explodeArc(e.layer, e);
  } else if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
    if (!e.vertices || e.vertices.length < 2) continue;
    for (let i = 0; i < e.vertices.length - 1; i++) {
      addSeg(e.layer, e.vertices[i].x, e.vertices[i].y, e.vertices[i+1].x, e.vertices[i+1].y);
    }
    if (e.shape || e.closed) {
      const last = e.vertices[e.vertices.length - 1];
      addSeg(e.layer, last.x, last.y, e.vertices[0].x, e.vertices[0].y);
    }
  } else if (e.type === 'TEXT' || e.type === 'MTEXT') {
    const pos = e.position ?? e.startPoint ?? {};
    if (pos.x == null) continue;
    textsAll.push({ x: pos.x, y: pos.y, raw: e.text ?? '', layer: e.layer, height: e.textHeight ?? e.height ?? 0 });
  }
}

let lotMinX = Infinity, lotMinY = Infinity, lotMaxX = -Infinity, lotMaxY = -Infinity;
for (const layer of LOT_LAYERS) {
  const segs = linesByLayer.get(layer) ?? [];
  for (const s of segs) {
    lotMinX = Math.min(lotMinX, s.x1, s.x2);
    lotMinY = Math.min(lotMinY, s.y1, s.y2);
    lotMaxX = Math.max(lotMaxX, s.x1, s.x2);
    lotMaxY = Math.max(lotMaxY, s.y1, s.y2);
  }
}
const padX = (lotMaxX - lotMinX) * 0.04;
const padY = (lotMaxY - lotMinY) * 0.04;
const clipMinX = lotMinX - padX, clipMinY = lotMinY - padY;
const clipMaxX = lotMaxX + padX, clipMaxY = lotMaxY + padY;
const clipW = clipMaxX - clipMinX;
const clipH = clipMaxY - clipMinY;
console.log(`Lot bbox: (${lotMinX.toFixed(1)}, ${lotMinY.toFixed(1)}) → (${lotMaxX.toFixed(1)}, ${lotMaxY.toFixed(1)})`);
console.log(`Clip:     ${clipW.toFixed(1)} × ${clipH.toFixed(1)} ft`);

function inClip(x, y) {
  return x >= clipMinX && x <= clipMaxX && y >= clipMinY && y <= clipMaxY;
}

const VIEW_W = 1600;
const VIEW_H = Math.round(VIEW_W * (clipH / clipW));
const scale = VIEW_W / clipW;
const tx = (x) => (x - clipMinX) * scale;
const ty = (y) => VIEW_H - (y - clipMinY) * scale;

console.log(`SVG viewport: ${VIEW_W} × ${VIEW_H}`);

const colors = {
  'C-PROP-LINE - SUB LOTS': '#d9a437',
  'PROP CENTER LINE': '#52503f',
  'PROP. UTILITY EASEMENT': '#785420',
  'PROP_PAVING': '#3d2c15',
};
const widths = {
  'C-PROP-LINE - SUB LOTS': 1.2,
  'PROP CENTER LINE': 0.5,
  'PROP. UTILITY EASEMENT': 0.5,
  'PROP_PAVING': 0.6,
};
const dashes = {
  'PROP CENTER LINE': '4,4',
  'PROP. UTILITY EASEMENT': '2,2',
};

const svgGroups = [];
for (const layer of ['PROP_PAVING', 'PROP. UTILITY EASEMENT', 'PROP CENTER LINE', 'C-PROP-LINE - SUB LOTS']) {
  const segs = (linesByLayer.get(layer) ?? []).filter(s => inClip(s.x1, s.y1) || inClip(s.x2, s.y2));
  if (!segs.length) continue;
  const lines = segs.map(s =>
    `<line x1="${tx(s.x1).toFixed(1)}" y1="${ty(s.y1).toFixed(1)}" x2="${tx(s.x2).toFixed(1)}" y2="${ty(s.y2).toFixed(1)}"/>`
  ).join('');
  const color = colors[layer] ?? '#52503f';
  const w = widths[layer] ?? 0.6;
  const dash = dashes[layer] ? ` stroke-dasharray="${dashes[layer]}"` : '';
  svgGroups.push(`<g stroke="${color}" stroke-width="${w}" fill="none"${dash}>${lines}</g>`);
}

const cleanText = (raw) => raw
  .replace(/\\[A-Za-z]+\d*(?:\.\d+)?(?:[xoX])?;?/g, '')
  .replace(/\\[fF][^;|]*\|[^;]*;/g, '')
  .replace(/\\[CWHQK][^;]*;/g, '')
  .replace(/\\[Pp]/g, ' ')
  .replace(/[{}]/g, '')
  .replace(/%%[Pp]/g, '±')
  .replace(/%%[Cc]/g, 'Ø')
  .replace(/\s+/g, ' ')
  .trim();

const lotLabels = [];
const otherLabels = [];
const labelRe = /\bLOT\s+(\d{1,3})\b/i;
for (const t of textsAll) {
  if (!inClip(t.x, t.y)) continue;
  const cleaned = cleanText(t.raw);
  const m = cleaned.match(labelRe);
  if (m) {
    lotLabels.push({ x: t.x, y: t.y, num: m[1], cleaned });
  } else if (cleaned.length > 0) {
    otherLabels.push({ x: t.x, y: t.y, text: cleaned });
  }
}
console.log(`\nLot-number labels (regex /LOT \\d+/): ${lotLabels.length}`);
console.log(`Other labels in clip: ${otherLabels.length}`);
if (lotLabels.length) {
  console.log('  First 10 lot labels:');
  for (const l of lotLabels.slice(0, 10)) console.log(`    LOT ${l.num} at (${l.x.toFixed(0)}, ${l.y.toFixed(0)})`);
}
if (otherLabels.length) {
  console.log('  First 10 other labels (likely street names):');
  for (const l of otherLabels.slice(0, 10)) console.log(`    "${l.text.slice(0, 50)}"`);
}

const allSegs = [];
for (const layer of [...LOT_LAYERS, ...EASEMENT_LAYERS]) {
  for (const s of linesByLayer.get(layer) ?? []) {
    if (inClip(s.x1, s.y1) || inClip(s.x2, s.y2)) allSegs.push(s);
  }
}
console.log(`\nReconstruction inputs: ${allSegs.length} segments from lot+easement layers in clip`);

const TOL = Math.max(clipW, clipH) * 0.001;
const verts = [];
function snapV(x, y) {
  for (let i = 0; i < verts.length; i++) {
    if (Math.abs(verts[i].x - x) < TOL && Math.abs(verts[i].y - y) < TOL) return i;
  }
  verts.push({ x, y });
  return verts.length - 1;
}
const adj = new Map();
function addEdge(a, b) {
  if (a === b) return;
  if (!adj.has(a)) adj.set(a, new Set());
  if (!adj.has(b)) adj.set(b, new Set());
  adj.get(a).add(b);
  adj.get(b).add(a);
}
for (const s of allSegs) {
  addEdge(snapV(s.x1, s.y1), snapV(s.x2, s.y2));
}
const edgeCount = [...adj.values()].reduce((s, set) => s + set.size, 0) / 2;
const avgDeg = [...adj.values()].reduce((s, set) => s + set.size, 0) / adj.size;
console.log(`After snap (tol=${TOL.toFixed(2)}): ${verts.length} vertices, ${edgeCount} edges, avg degree ${avgDeg.toFixed(2)}`);

function angleFromTo(a, b) {
  return Math.atan2(verts[b].y - verts[a].y, verts[b].x - verts[a].x);
}

const usedDirected = new Set();
const faces = [];
for (const [start, neighbors] of adj) {
  for (const next of neighbors) {
    const ek = `${start}->${next}`;
    if (usedDirected.has(ek)) continue;
    const path = [start];
    const directedUsed = new Set([ek]);
    let prev = start, cur = next;
    let safe = 0;
    while (cur !== start && safe++ < 500) {
      path.push(cur);
      const nbs = [...adj.get(cur)].filter(n => n !== prev);
      if (!nbs.length) break;
      const inAng = angleFromTo(cur, prev);
      let bestN = null, bestTurn = -Infinity;
      for (const n of nbs) {
        const out = angleFromTo(cur, n);
        let turn = inAng - out;
        while (turn <= 1e-9) turn += Math.PI * 2;
        if (turn > bestTurn) { bestTurn = turn; bestN = n; }
      }
      if (bestN == null) break;
      const nek = `${cur}->${bestN}`;
      if (directedUsed.has(nek)) break;
      directedUsed.add(nek);
      prev = cur;
      cur = bestN;
    }
    if (cur === start && path.length >= 3) {
      for (let i = 0; i < path.length; i++) {
        usedDirected.add(`${path[i]}->${path[(i+1) % path.length]}`);
      }
      faces.push(path);
    }
  }
}
console.log(`Closed faces detected: ${faces.length}`);

function area(face) {
  let a = 0;
  for (let i = 0; i < face.length; i++) {
    const p = verts[face[i]];
    const q = verts[face[(i+1) % face.length]];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

const totalA = clipW * clipH;
const candidates = faces.map(f => ({ f, a: area(f) }))
  .filter(c => c.a > 0)
  .filter(c => c.a > totalA * 0.0001 && c.a < totalA * 0.6)
  .sort((a, b) => b.a - a.a);
console.log(`Candidate lot faces (positive orientation, area filter): ${candidates.length}`);
if (candidates.length) {
  const median = candidates[Math.floor(candidates.length / 2)].a;
  console.log(`  area range: ${candidates[candidates.length - 1].a.toFixed(0)} → ${candidates[0].a.toFixed(0)} sq ft`);
  console.log(`  median: ${median.toFixed(0)} sq ft`);
}

function pip(face, x, y) {
  let inside = false;
  for (let i = 0, j = face.length - 1; i < face.length; j = i++) {
    const xi = verts[face[i]].x, yi = verts[face[i]].y;
    const xj = verts[face[j]].x, yj = verts[face[j]].y;
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const lotsResolved = [];
const labelToFace = new Map();
for (const lab of lotLabels) {
  let foundIdx = null;
  for (let i = 0; i < candidates.length; i++) {
    if (pip(candidates[i].f, lab.x, lab.y)) {
      foundIdx = i;
      break;
    }
  }
  if (foundIdx != null) {
    if (!labelToFace.has(foundIdx)) {
      labelToFace.set(foundIdx, lab);
    }
  }
}
console.log(`\nLot labels matched to faces: ${labelToFace.size} / ${lotLabels.length}`);

let unnumberedCount = 0;
for (let i = 0; i < candidates.length; i++) {
  const c = candidates[i];
  const lab = labelToFace.get(i);
  const pts = c.f.map(vi => ({ x: tx(verts[vi].x), y: ty(verts[vi].y) }));
  const points = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lot_number = lab ? lab.num : `?${++unnumberedCount}`;
  lotsResolved.push({
    lot_number,
    polygon_points: points,
    size_sqft: Math.round(c.a),
    matched_label: !!lab,
  });
}

const matched = lotsResolved.filter(l => l.matched_label).length;
console.log(`Lots with matched lot number: ${matched}`);
console.log(`Lots without matched label (will get placeholder): ${lotsResolved.length - matched}`);

const svgLabels = lotLabels.map(l =>
  `<g><circle cx="${tx(l.x).toFixed(1)}" cy="${ty(l.y).toFixed(1)}" r="6" fill="#d9a437"/><text x="${tx(l.x).toFixed(1)}" y="${(ty(l.y) - 8).toFixed(1)}" text-anchor="middle" font-size="14" fill="#f8ecc8">${l.num}</text></g>`
).join('');
const svgFaces = lotsResolved.map((l, i) =>
  `<polygon points="${l.polygon_points}" fill="rgba(217,164,55,${l.matched_label ? 0.18 : 0.05})" stroke="#d9a437" stroke-width="0.6"/>`
).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet">
<rect width="100%" height="100%" fill="#100f0d"/>
<g id="streets-and-easements">
${svgGroups.join('\n')}
</g>
<g id="lots">${svgFaces}</g>
<g id="labels">${svgLabels}</g>
</svg>`;
const svgPath = `${outDir}/${slug}-plat-debug.svg`;
const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet">
<rect width="100%" height="100%" fill="#100f0d"/>
${svgGroups.join('\n')}
</svg>`;
const cleanPath = `${outDir}/${slug}-plat.svg`;
const jsonPath = `${outDir}/${slug}-lots.json`;

writeFileSync(svgPath, svg);
writeFileSync(cleanPath, cleanSvg);
writeFileSync(jsonPath, JSON.stringify({
  viewport: { width: VIEW_W, height: VIEW_H },
  source_extent: { minX: clipMinX, minY: clipMinY, maxX: clipMaxX, maxY: clipMaxY },
  lots: lotsResolved,
}, null, 2));

console.log(`\n✓ ${cleanPath}    (clean plat backdrop)`);
console.log(`✓ ${svgPath}    (debug overlay with detected polygons + labels)`);
console.log(`✓ ${jsonPath}    (${lotsResolved.length} lot polygons)`);
