import { readFileSync, writeFileSync } from 'node:fs';
import DxfParser from 'dxf-parser';

const file = process.argv[2];
const outDir = process.argv[3] ?? 'public/plats';
const slug = process.argv[4] ?? 'plat';
if (!file) { console.error('usage: node dxf-extract-v3.mjs <dxf> [outDir] [slug]'); process.exit(1); }

const dxf = new DxfParser().parseSync(readFileSync(file, 'utf8'));

const lotLines = [];
const lotArcs = [];
const allByLayer = new Map();
function bumpLayer(layer, seg) {
  if (!allByLayer.has(layer)) allByLayer.set(layer, []);
  allByLayer.get(layer).push(seg);
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
    bumpLayer(layer, { x1: prev.x, y1: prev.y, x2: next.x, y2: next.y });
    prev = next;
  }
}

for (const e of dxf.entities) {
  if (e.type === 'LINE') {
    const seg = { x1: e.vertices[0].x, y1: e.vertices[0].y, x2: e.vertices[1].x, y2: e.vertices[1].y };
    bumpLayer(e.layer, seg);
    if (e.layer === 'C-PROP-LINE - SUB LOTS') lotLines.push(seg);
  } else if (e.type === 'ARC') {
    explodeArc(e.layer, e);
    if (e.layer === 'C-PROP-LINE - SUB LOTS') {
      const cx = e.center.x, cy = e.center.y, r = e.radius;
      const a0 = (e.startAngle * Math.PI) / 180;
      let a1 = (e.endAngle * Math.PI) / 180;
      while (a1 < a0) a1 += Math.PI * 2;
      lotArcs.push({ cx, cy, r, a0, a1, layer: e.layer });
    }
  } else if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
    if (!e.vertices || e.vertices.length < 2) continue;
    for (let i = 0; i < e.vertices.length - 1; i++) {
      bumpLayer(e.layer, { x1: e.vertices[i].x, y1: e.vertices[i].y, x2: e.vertices[i+1].x, y2: e.vertices[i+1].y });
    }
  }
}
console.log(`lot LINE: ${lotLines.length}, lot ARC: ${lotArcs.length}`);

let lotMinX = Infinity, lotMinY = Infinity, lotMaxX = -Infinity, lotMaxY = -Infinity;
for (const s of lotLines) {
  lotMinX = Math.min(lotMinX, s.x1, s.x2);
  lotMinY = Math.min(lotMinY, s.y1, s.y2);
  lotMaxX = Math.max(lotMaxX, s.x1, s.x2);
  lotMaxY = Math.max(lotMaxY, s.y1, s.y2);
}
const padX = (lotMaxX - lotMinX) * 0.04;
const padY = (lotMaxY - lotMinY) * 0.04;
const clipMinX = lotMinX - padX, clipMinY = lotMinY - padY;
const clipMaxX = lotMaxX + padX, clipMaxY = lotMaxY + padY;
const clipW = clipMaxX - clipMinX;
const clipH = clipMaxY - clipMinY;
console.log(`Lot bbox: ${(lotMaxX - lotMinX).toFixed(0)} × ${(lotMaxY - lotMinY).toFixed(0)} ft`);

function lineProps(seg) {
  const dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1;
  const len = Math.hypot(dx, dy);
  let theta = Math.atan2(dy, dx);
  if (theta < 0) theta += Math.PI;
  if (theta >= Math.PI - 1e-6) theta -= Math.PI;
  return { dx, dy, len, theta, midX: (seg.x1 + seg.x2) / 2, midY: (seg.y1 + seg.y2) / 2 };
}

const enriched = lotLines.map(s => ({ s, p: lineProps(s) })).filter(e => e.p.len > 12 && e.p.len < 500);
console.log(`After length filter: ${enriched.length}`);

const ANGLE_TOL = (6 * Math.PI) / 180;
function angleDist(a, b) {
  let d = Math.abs(a - b);
  if (d > Math.PI / 2) d = Math.PI - d;
  return d;
}
const groups = [];
for (const e of enriched) {
  let g = groups.find(g => angleDist(g.theta, e.p.theta) < ANGLE_TOL);
  if (!g) {
    g = { theta: e.p.theta, lines: [] };
    groups.push(g);
  }
  g.lines.push(e);
  g.theta = (g.theta * (g.lines.length - 1) + e.p.theta) / g.lines.length;
}
groups.sort((a, b) => b.lines.length - a.lines.length);
console.log('Orientation groups:');
for (const g of groups.slice(0, 12)) {
  console.log(`  θ ≈ ${((g.theta * 180) / Math.PI).toFixed(1)}°  count=${g.lines.length}`);
}

const allLots = [];
const usedLineIds = new Set();
let nextLotId = 0;

function classifyAlongPerp(group) {
  const dirX = Math.cos(group.theta), dirY = Math.sin(group.theta);
  const perpX = -dirY, perpY = dirX;
  return group.lines.map(e => {
    const t0 = e.s.x1 * dirX + e.s.y1 * dirY;
    const t1 = e.s.x2 * dirX + e.s.y2 * dirY;
    const u0 = e.s.x1 * perpX + e.s.y1 * perpY;
    const u1 = e.s.x2 * perpX + e.s.y2 * perpY;
    return {
      e,
      tMin: Math.min(t0, t1), tMax: Math.max(t0, t1),
      u: (u0 + u1) / 2,
      tMid: (t0 + t1) / 2,
    };
  });
}

function processGroup(group) {
  if (group.lines.length < 2) return;
  const lines = classifyAlongPerp(group);
  lines.sort((a, b) => a.tMid - b.tMid);

  const ROW_GAP = Math.min(clipW, clipH) * 0.06;
  const rows = [];
  for (const ln of lines) {
    let placed = false;
    for (const r of rows) {
      if (Math.abs(ln.tMid - r.tMidAvg) < ROW_GAP) {
        r.lines.push(ln);
        r.tMidAvg = (r.tMidAvg * (r.lines.length - 1) + ln.tMid) / r.lines.length;
        placed = true;
        break;
      }
    }
    if (!placed) rows.push({ tMidAvg: ln.tMid, lines: [ln] });
  }

  for (const r of rows) {
    if (r.lines.length < 2) continue;
    r.lines.sort((a, b) => a.u - b.u);

    for (let i = 0; i < r.lines.length - 1; i++) {
      const a = r.lines[i], b = r.lines[i + 1];
      if (usedLineIds.has(a.e) && usedLineIds.has(b.e)) continue;
      const gap = Math.abs(b.u - a.u);
      if (gap < 6 || gap > 280) continue;
      const overlap = Math.max(0, Math.min(a.tMax, b.tMax) - Math.max(a.tMin, b.tMin));
      const minSpan = Math.min(a.tMax - a.tMin, b.tMax - b.tMin);
      if (overlap < minSpan * 0.20) continue;
      const quad = [
        { x: a.e.s.x1, y: a.e.s.y1 },
        { x: a.e.s.x2, y: a.e.s.y2 },
        { x: b.e.s.x2, y: b.e.s.y2 },
        { x: b.e.s.x1, y: b.e.s.y1 },
      ];
      const cx = quad.reduce((s, p) => s + p.x, 0) / 4;
      const cy = quad.reduce((s, p) => s + p.y, 0) / 4;
      const ordered = [...quad].sort((p, q) => Math.atan2(p.y - cy, p.x - cx) - Math.atan2(q.y - cy, q.x - cx));
      let area = 0;
      for (let k = 0; k < 4; k++) {
        const p = ordered[k], q = ordered[(k + 1) % 4];
        area += p.x * q.y - q.x * p.y;
      }
      area = Math.abs(area / 2);
      if (area < 1200 || area > 80000) continue;
      usedLineIds.add(a.e); usedLineIds.add(b.e);
      allLots.push({ id: nextLotId++, polygon_world: ordered, size_sqft: Math.round(area), source: 'pair', orient: ((group.theta * 180) / Math.PI).toFixed(0) });
    }
  }
}

for (const g of groups) processGroup(g);
console.log(`After pair-based pass: ${allLots.length} lots`);

const usedRadialLines = new Set();
for (const arc of lotArcs) {
  const radials = [];
  for (const e of enriched) {
    if (usedLineIds.has(e) && usedRadialLines.has(e)) continue;
    const d1 = Math.hypot(e.s.x1 - arc.cx, e.s.y1 - arc.cy);
    const d2 = Math.hypot(e.s.x2 - arc.cx, e.s.y2 - arc.cy);
    const minD = Math.min(d1, d2);
    if (minD > arc.r * 0.3) continue;
    const farPoint = d1 > d2 ? { x: e.s.x1, y: e.s.y1 } : { x: e.s.x2, y: e.s.y2 };
    const farDist = Math.max(d1, d2);
    if (farDist < arc.r * 0.6) continue;
    const ang = Math.atan2(farPoint.y - arc.cy, farPoint.x - arc.cx);
    let normAng = ang;
    while (normAng < arc.a0 - 0.1) normAng += Math.PI * 2;
    if (normAng > arc.a1 + 0.1) continue;
    radials.push({ e, ang: normAng, far: farPoint, near: d1 < d2 ? { x: e.s.x1, y: e.s.y1 } : { x: e.s.x2, y: e.s.y2 } });
  }
  radials.sort((a, b) => a.ang - b.ang);

  for (let i = 0; i < radials.length - 1; i++) {
    const a = radials[i], b = radials[i + 1];
    const da = b.ang - a.ang;
    if (da < 0.05 || da > Math.PI / 2) continue;
    const arcSteps = Math.max(2, Math.ceil(da / 0.15));
    const arcPts = [];
    for (let k = 0; k <= arcSteps; k++) {
      const t = a.ang + (da * k) / arcSteps;
      arcPts.push({ x: arc.cx + arc.r * Math.cos(t), y: arc.cy + arc.r * Math.sin(t) });
    }
    const poly = [a.far, ...arcPts, b.far];
    let area = 0;
    for (let k = 0; k < poly.length; k++) {
      const p = poly[k], q = poly[(k + 1) % poly.length];
      area += p.x * q.y - q.x * p.y;
    }
    area = Math.abs(area / 2);
    if (area < 1200 || area > 80000) continue;
    usedRadialLines.add(a.e); usedRadialLines.add(b.e);
    allLots.push({ id: nextLotId++, polygon_world: poly, size_sqft: Math.round(area), source: 'arc' });
  }
}
console.log(`After cul-de-sac arc pass: ${allLots.length} lots (${allLots.filter(l => l.source === 'arc').length} arc-derived)`);

allLots.sort((a, b) => {
  const ay = a.polygon_world.reduce((s, p) => s + p.y, 0) / a.polygon_world.length;
  const by = b.polygon_world.reduce((s, p) => s + p.y, 0) / b.polygon_world.length;
  if (Math.abs(ay - by) > 60) return by - ay;
  const ax = a.polygon_world.reduce((s, p) => s + p.x, 0) / a.polygon_world.length;
  const bx = b.polygon_world.reduce((s, p) => s + p.x, 0) / b.polygon_world.length;
  return ax - bx;
});
allLots.forEach((l, i) => l.lot_number = String(i + 1));

const VIEW_W = 1600;
const VIEW_H = Math.round(VIEW_W * (clipH / clipW));
const tx = (x) => ((x - clipMinX) / clipW) * VIEW_W;
const ty = (y) => VIEW_H - ((y - clipMinY) / clipH) * VIEW_H;

function inClip(x, y) { return x >= clipMinX && x <= clipMaxX && y >= clipMinY && y <= clipMaxY; }

const colors = { 'C-PROP-LINE - SUB LOTS': '#d9a437', 'PROP CENTER LINE': '#52503f', 'PROP. UTILITY EASEMENT': '#785420', 'PROP_PAVING': '#3d2c15' };
const widths = { 'C-PROP-LINE - SUB LOTS': 1.0, 'PROP CENTER LINE': 0.5, 'PROP. UTILITY EASEMENT': 0.4, 'PROP_PAVING': 0.6 };
const dashes = { 'PROP CENTER LINE': '5,5', 'PROP. UTILITY EASEMENT': '2,3' };
const layerSvgs = [];
for (const layer of ['PROP_PAVING', 'PROP. UTILITY EASEMENT', 'PROP CENTER LINE', 'C-PROP-LINE - SUB LOTS']) {
  const segs = (allByLayer.get(layer) ?? []).filter(s => inClip(s.x1, s.y1) || inClip(s.x2, s.y2));
  if (!segs.length) continue;
  const lines = segs.map(s => `<line x1="${tx(s.x1).toFixed(1)}" y1="${ty(s.y1).toFixed(1)}" x2="${tx(s.x2).toFixed(1)}" y2="${ty(s.y2).toFixed(1)}"/>`).join('');
  const dash = dashes[layer] ? ` stroke-dasharray="${dashes[layer]}"` : '';
  layerSvgs.push(`<g stroke="${colors[layer]}" stroke-width="${widths[layer]}" fill="none"${dash}>${lines}</g>`);
}

const lotsForOutput = allLots.map(l => {
  const pts = l.polygon_world.map(p => ({ x: tx(p.x), y: ty(p.y) }));
  return { lot_number: l.lot_number, polygon_points: pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '), size_sqft: l.size_sqft, source: l.source };
});

const debugPolys = lotsForOutput.map(l => `<polygon points="${l.polygon_points}" fill="${l.source === 'arc' ? 'rgba(216,80,80,0.25)' : 'rgba(217,164,55,0.18)'}" stroke="${l.source === 'arc' ? '#d85050' : '#d9a437'}" stroke-width="0.6"/>`).join('');
const debugNumbers = lotsForOutput.map(l => {
  const pts = l.polygon_points.split(' ').map(p => p.split(',').map(Number));
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0d0c08" font-weight="700">${l.lot_number}</text>`;
}).join('');

const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet"><rect width="100%" height="100%" fill="#100f0d"/>\n${layerSvgs.join('\n')}\n</svg>`;
const debugSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet"><rect width="100%" height="100%" fill="#100f0d"/>\n${layerSvgs.join('\n')}\n<g>${debugPolys}</g><g>${debugNumbers}</g></svg>`;

writeFileSync(`${outDir}/${slug}-plat.svg`, cleanSvg);
writeFileSync(`${outDir}/${slug}-plat-debug.svg`, debugSvg);
writeFileSync(`${outDir}/${slug}-lots.json`, JSON.stringify({
  viewport: { width: VIEW_W, height: VIEW_H },
  source_extent: { minX: clipMinX, minY: clipMinY, maxX: clipMaxX, maxY: clipMaxY },
  lots: lotsForOutput,
}, null, 2));

const sizes = allLots.map(l => l.size_sqft).sort((a, b) => a - b);
console.log(`\n✓ Total lots: ${allLots.length}`);
if (sizes.length) {
  console.log(`  size: ${sizes[0]} → ${sizes[sizes.length - 1]} sq ft, median ${sizes[Math.floor(sizes.length / 2)]}`);
}
console.log(`\n✓ ${outDir}/${slug}-plat.svg`);
console.log(`✓ ${outDir}/${slug}-plat-debug.svg`);
console.log(`✓ ${outDir}/${slug}-lots.json`);
