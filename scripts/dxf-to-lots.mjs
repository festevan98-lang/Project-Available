import { readFileSync, writeFileSync } from 'node:fs';
import DxfParser from 'dxf-parser';

const file = process.argv[2];
const layerName = process.argv[3] ?? 'C-PROP-LINE - SUB LOTS';
const outJson = process.argv[4] ?? 'lots.json';
const outSvg = process.argv[5] ?? 'plat.svg';

if (!file) {
  console.error('usage: node dxf-to-lots.mjs <dxf> [layerName] [out.json] [out.svg]');
  process.exit(1);
}

console.log(`Reading ${file}...`);
const text = readFileSync(file, 'utf8');
console.log(`Parsing DXF (${(text.length / 1024 / 1024).toFixed(1)} MB)...`);
const parser = new DxfParser();
const dxf = parser.parseSync(text);

if (!dxf || !dxf.entities) {
  console.error('Failed to parse DXF or no entities.');
  process.exit(1);
}
console.log(`Entities: ${dxf.entities.length}`);

const lotEntities = dxf.entities.filter((e) => e.layer === layerName);
console.log(`Entities on layer "${layerName}": ${lotEntities.length}`);

const lines = lotEntities.filter((e) => e.type === 'LINE');
const arcs = lotEntities.filter((e) => e.type === 'ARC');
const polylines = lotEntities.filter((e) => e.type === 'LWPOLYLINE' || e.type === 'POLYLINE');
console.log(`  LINE: ${lines.length}`);
console.log(`  ARC: ${arcs.length}`);
console.log(`  POLYLINE: ${polylines.length}`);

const segments = [];
for (const ln of lines) {
  segments.push({
    x1: ln.vertices[0].x,
    y1: ln.vertices[0].y,
    x2: ln.vertices[1].x,
    y2: ln.vertices[1].y,
  });
}
for (const arc of arcs) {
  const cx = arc.center.x;
  const cy = arc.center.y;
  const r = arc.radius;
  const a0 = (arc.startAngle * Math.PI) / 180;
  const a1Raw = (arc.endAngle * Math.PI) / 180;
  let a1 = a1Raw;
  while (a1 < a0) a1 += Math.PI * 2;
  const steps = Math.max(4, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 32));
  let prev = { x: cx + r * Math.cos(a0), y: cy + r * Math.sin(a0) };
  for (let i = 1; i <= steps; i++) {
    const t = a0 + ((a1 - a0) * i) / steps;
    const next = { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
    segments.push({ x1: prev.x, y1: prev.y, x2: next.x, y2: next.y });
    prev = next;
  }
}

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const s of segments) {
  minX = Math.min(minX, s.x1, s.x2);
  minY = Math.min(minY, s.y1, s.y2);
  maxX = Math.max(maxX, s.x1, s.x2);
  maxY = Math.max(maxY, s.y1, s.y2);
}
const width = maxX - minX;
const height = maxY - minY;
console.log(`\nLot-layer bounding box: ${width.toFixed(1)} x ${height.toFixed(1)}`);

const TOL = Math.max(width, height) * 0.0005;
console.log(`Vertex snap tolerance: ${TOL.toFixed(3)}`);

const verts = [];
function snapVertex(x, y) {
  for (let i = 0; i < verts.length; i++) {
    const v = verts[i];
    if (Math.abs(v.x - x) < TOL && Math.abs(v.y - y) < TOL) return i;
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
for (const s of segments) {
  const a = snapVertex(s.x1, s.y1);
  const b = snapVertex(s.x2, s.y2);
  addEdge(a, b);
}
console.log(`Vertices after snap: ${verts.length}, edges: ${[...adj.values()].reduce((s, set) => s + set.size, 0) / 2}`);

function angle(from, to) {
  return Math.atan2(verts[to].y - verts[from].y, verts[to].x - verts[from].x);
}

function findFaces() {
  const used = new Set();
  const faces = [];
  for (const [start, neighbors] of adj) {
    for (const next of neighbors) {
      const key = `${start}->${next}`;
      if (used.has(key)) continue;
      const face = [start];
      let prev = start;
      let curr = next;
      const visitedEdges = new Set([key]);
      let safety = 0;
      while (curr !== start && safety++ < 1000) {
        face.push(curr);
        const nbs = [...adj.get(curr)].filter((n) => n !== prev);
        if (nbs.length === 0) break;
        const fromAngle = angle(curr, prev);
        let bestN = null, bestTurn = -Infinity;
        for (const n of nbs) {
          const ang = angle(curr, n);
          let turn = fromAngle - ang;
          while (turn <= 0) turn += Math.PI * 2;
          while (turn > Math.PI * 2) turn -= Math.PI * 2;
          if (turn > bestTurn) {
            bestTurn = turn;
            bestN = n;
          }
        }
        if (bestN == null) break;
        const ek = `${curr}->${bestN}`;
        if (visitedEdges.has(ek)) break;
        visitedEdges.add(ek);
        prev = curr;
        curr = bestN;
      }
      if (curr === start && face.length >= 3) {
        for (let i = 0; i < face.length; i++) {
          used.add(`${face[i]}->${face[(i + 1) % face.length]}`);
        }
        faces.push(face);
      }
    }
  }
  return faces;
}

const faces = findFaces();
console.log(`\nClosed faces found: ${faces.length}`);

function polygonArea(face) {
  let a = 0;
  for (let i = 0; i < face.length; i++) {
    const p1 = verts[face[i]];
    const p2 = verts[face[(i + 1) % face.length]];
    a += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.abs(a / 2);
}

const totalArea = width * height;
const lotFaces = faces
  .map((f) => ({ face: f, area: polygonArea(f) }))
  .filter((f) => f.area > totalArea * 0.0002 && f.area < totalArea * 0.5)
  .sort((a, b) => b.area - a.area);

console.log(`Plausible lot faces (filtered by area): ${lotFaces.length}`);

if (lotFaces.length > 0) {
  console.log(`  largest: ${lotFaces[0].area.toFixed(0)} sq units`);
  console.log(`  median: ${lotFaces[Math.floor(lotFaces.length / 2)].area.toFixed(0)} sq units`);
  console.log(`  smallest: ${lotFaces[lotFaces.length - 1].area.toFixed(0)} sq units`);
}

const VIEW_W = 1600;
const VIEW_H = 1200;
const scale = Math.min(VIEW_W / width, VIEW_H / height);
const offsetX = (VIEW_W - width * scale) / 2;
const offsetY = (VIEW_H - height * scale) / 2;

function toView(p) {
  return {
    x: (p.x - minX) * scale + offsetX,
    y: VIEW_H - ((p.y - minY) * scale + offsetY),
  };
}

const lots = lotFaces.map((f, i) => {
  const pts = f.face.map((vi) => toView(verts[vi]));
  const points = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const sqftRaw = f.area;
  return {
    lot_number: String(i + 1),
    polygon_points: points,
    size_sqft: Math.round(sqftRaw),
    centroid: { x: cx, y: cy },
  };
});

writeFileSync(outJson, JSON.stringify({
  viewport: { width: VIEW_W, height: VIEW_H },
  source_extent: { minX, minY, maxX, maxY, width, height },
  lots,
}, null, 2));
console.log(`\n✓ Wrote ${outJson} with ${lots.length} lots`);

const svgLines = segments.map((s) => {
  const p1 = toView({ x: s.x1, y: s.y1 });
  const p2 = toView({ x: s.x2, y: s.y2 });
  return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" />`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet">
<rect width="100%" height="100%" fill="#100f0d"/>
<g stroke="#52503f" stroke-width="0.8" fill="none" stroke-linecap="round">
${svgLines}
</g>
</svg>`;
writeFileSync(outSvg, svg);
console.log(`✓ Wrote ${outSvg} (${(svg.length / 1024).toFixed(1)} KB)`);
