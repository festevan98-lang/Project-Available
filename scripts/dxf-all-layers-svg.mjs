import { readFileSync, writeFileSync } from 'node:fs';
import DxfParser from 'dxf-parser';

const file = process.argv[2];
const out = process.argv[3] ?? 'all-layers.svg';
if (!file) {
  console.error('usage: node dxf-all-layers-svg.mjs <dxf> [out.svg]');
  process.exit(1);
}

const text = readFileSync(file, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

const segments = [];
const polygons = [];
const labels = [];

for (const e of dxf.entities) {
  if (e.type === 'LINE') {
    segments.push({
      x1: e.vertices[0].x, y1: e.vertices[0].y,
      x2: e.vertices[1].x, y2: e.vertices[1].y,
      layer: e.layer,
    });
  } else if (e.type === 'ARC') {
    const cx = e.center.x, cy = e.center.y, r = e.radius;
    const a0 = (e.startAngle * Math.PI) / 180;
    let a1 = (e.endAngle * Math.PI) / 180;
    while (a1 < a0) a1 += Math.PI * 2;
    const steps = Math.max(8, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 48));
    let prev = { x: cx + r * Math.cos(a0), y: cy + r * Math.sin(a0) };
    for (let i = 1; i <= steps; i++) {
      const t = a0 + ((a1 - a0) * i) / steps;
      const next = { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
      segments.push({ x1: prev.x, y1: prev.y, x2: next.x, y2: next.y, layer: e.layer });
      prev = next;
    }
  } else if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
    if (!e.vertices || e.vertices.length < 2) continue;
    const pts = e.vertices.map(v => ({ x: v.x, y: v.y }));
    polygons.push({ points: pts, closed: !!e.shape, layer: e.layer });
    for (let i = 0; i < pts.length - 1; i++) {
      segments.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[i+1].x, y2: pts[i+1].y, layer: e.layer });
    }
    if (e.shape) {
      segments.push({ x1: pts[pts.length-1].x, y1: pts[pts.length-1].y, x2: pts[0].x, y2: pts[0].y, layer: e.layer });
    }
  } else if (e.type === 'TEXT' || e.type === 'MTEXT') {
    labels.push({
      x: e.position?.x ?? e.startPoint?.x,
      y: e.position?.y ?? e.startPoint?.y,
      text: e.text,
      layer: e.layer,
    });
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

const VIEW_W = 1600;
const VIEW_H = Math.round(VIEW_W * height / width);
const scale = VIEW_W / width;

function tx(x) { return (x - minX) * scale; }
function ty(y) { return VIEW_H - (y - minY) * scale; }

const layerCounts = {};
for (const s of segments) {
  layerCounts[s.layer] = (layerCounts[s.layer] ?? 0) + 1;
}
console.log('Lines per layer in model space:');
for (const [l, c] of Object.entries(layerCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(c).padStart(5)}  ${l}`);
}

const colors = {
  'C-PROP-LINE - SUB LOTS': '#d9a437',
  'PROP CENTER LINE': '#52503f',
  'PROP. UTILITY EASEMENT': '#785420',
  'PROP_PAVING': '#3d2c15',
  'MONUMENTS': '#a8a496',
};

const groups = {};
for (const s of segments) {
  if (!groups[s.layer]) groups[s.layer] = [];
  groups[s.layer].push(s);
}
const groupSvg = Object.entries(groups).map(([layer, segs]) => {
  const color = colors[layer] ?? '#52503f';
  const lines = segs.map(s =>
    `<line x1="${tx(s.x1).toFixed(1)}" y1="${ty(s.y1).toFixed(1)}" x2="${tx(s.x2).toFixed(1)}" y2="${ty(s.y2).toFixed(1)}"/>`
  ).join('');
  return `<g data-layer="${layer.replace(/[<>&"]/g, '_')}" stroke="${color}" stroke-width="0.7" fill="none">${lines}</g>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet">
<rect width="100%" height="100%" fill="#100f0d"/>
${groupSvg}
</svg>`;
writeFileSync(out, svg);
console.log(`\n✓ Wrote ${out} (${(svg.length / 1024).toFixed(1)} KB, ${segments.length} segments)`);
console.log(`  view box: ${VIEW_W} x ${VIEW_H}`);
console.log(`  source:   ${width.toFixed(0)} x ${height.toFixed(0)}`);
console.log(`  ${labels.length} text labels found in model space`);
if (labels.length > 0) {
  console.log('  Text samples:');
  for (const l of labels.slice(0, 10)) {
    console.log(`    "${(l.text ?? '').slice(0, 50)}" on layer ${l.layer}`);
  }
}
