import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const file = process.argv[2];
if (!file) {
  console.error('usage: node dxf-deep-scan.mjs <path-to-dxf>');
  process.exit(1);
}

const rl = createInterface({
  input: createReadStream(file, { encoding: 'utf8' }),
  crlfDelay: Infinity,
});

const ENTITY_TYPES = new Set([
  'LWPOLYLINE', 'POLYLINE', 'LINE', 'TEXT', 'MTEXT',
  'CIRCLE', 'ARC', 'ELLIPSE', 'INSERT', 'HATCH', 'POINT', 'SEQEND', 'VERTEX',
]);

let section = null;
let prev = null;
let currentBlock = null;
let currentEntity = null;
let layer = null;
let xValue = null;
let yValue = null;
let textContent = null;
let blockName = null;

const stats = new Map();
const layerExtents = new Map();
const textSamples = new Map();
const blockEntities = new Map();
const insertLocations = [];

function bumpStats(s, b, l, t) {
  const key = `${s}|${b ?? ''}|${l ?? ''}|${t}`;
  stats.set(key, (stats.get(key) ?? 0) + 1);
}

function expandExtent(layerKey, x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') return;
  let ext = layerExtents.get(layerKey);
  if (!ext) {
    ext = { minX: x, minY: y, maxX: x, maxY: y, count: 0 };
    layerExtents.set(layerKey, ext);
  }
  ext.minX = Math.min(ext.minX, x);
  ext.minY = Math.min(ext.minY, y);
  ext.maxX = Math.max(ext.maxX, x);
  ext.maxY = Math.max(ext.maxY, y);
  ext.count += 1;
}

function flush() {
  if (currentEntity && layer) {
    const sec = section === 'BLOCKS' ? `BLOCKS:${currentBlock ?? '?'}` : section;
    bumpStats(sec, currentBlock, layer, currentEntity);
    if ((currentEntity === 'TEXT' || currentEntity === 'MTEXT') && textContent) {
      const k = `${sec}::${layer}`;
      const arr = textSamples.get(k) ?? [];
      if (arr.length < 30) arr.push(textContent.slice(0, 60));
      textSamples.set(k, arr);
    }
    if (currentEntity === 'INSERT' && currentBlock == null) {
      insertLocations.push({ block: blockName, layer, x: xValue, y: yValue });
    }
    if (xValue != null && yValue != null) {
      const k = `${sec}::${layer}::${currentEntity}`;
      expandExtent(k, xValue, yValue);
    }
  }
  currentEntity = null;
  layer = null;
  xValue = null;
  yValue = null;
  textContent = null;
  blockName = null;
}

for await (const raw of rl) {
  const line = raw.trim();

  if (prev === '0' && line === 'SECTION') {
    // expecting section name on next "  2"
  } else if (prev === '2' && (line === 'ENTITIES' || line === 'BLOCKS' || line === 'HEADER' || line === 'TABLES' || line === 'CLASSES' || line === 'OBJECTS' || line === 'THUMBNAILIMAGE')) {
    section = line;
  } else if (prev === '0' && line === 'ENDSEC') {
    flush();
    section = null;
    currentBlock = null;
  } else if (section === 'BLOCKS' && prev === '0' && line === 'BLOCK') {
    flush();
    currentBlock = '__pending__';
  } else if (section === 'BLOCKS' && currentBlock === '__pending__' && prev === '2') {
    currentBlock = line;
  } else if (section === 'BLOCKS' && prev === '0' && line === 'ENDBLK') {
    flush();
    currentBlock = null;
  } else if ((section === 'ENTITIES' || section === 'BLOCKS') && prev === '0' && ENTITY_TYPES.has(line)) {
    flush();
    currentEntity = line;
  } else if (currentEntity) {
    if (prev === '8') layer = line;
    else if (prev === '10' && xValue == null) xValue = parseFloat(line);
    else if (prev === '20' && yValue == null) yValue = parseFloat(line);
    else if ((prev === '1' || prev === '3') && (currentEntity === 'TEXT' || currentEntity === 'MTEXT') && !textContent) textContent = line;
    else if (prev === '2' && currentEntity === 'INSERT' && !blockName) blockName = line;
  }

  prev = line;
}
flush();

console.log('=== ENTITIES section: counts by (layer, type) — top 25 ===');
const summary = [...stats.entries()].map(([k, v]) => {
  const [sec, blk, lyr, type] = k.split('|');
  return { sec, blk, lyr, type, count: v };
}).sort((a, b) => b.count - a.count);

console.log(summary.filter(r => r.sec === 'ENTITIES').slice(0, 25).map(r =>
  `${String(r.count).padStart(5)}  ${r.type.padEnd(12)} ${r.lyr}`
).join('\n'));

console.log('\n=== BLOCK definitions (block name -> entity counts) ===');
const blocks = new Map();
for (const r of summary) {
  if (!r.sec.startsWith('BLOCKS:')) continue;
  const name = r.sec.slice(7);
  const map = blocks.get(name) ?? new Map();
  map.set(`${r.type}/${r.lyr}`, (map.get(`${r.type}/${r.lyr}`) ?? 0) + r.count);
  blocks.set(name, map);
}
const blockSummary = [...blocks.entries()].map(([n, m]) => ({
  name: n,
  totalEntities: [...m.values()].reduce((a, b) => a + b, 0),
  detail: m,
})).sort((a, b) => b.totalEntities - a.totalEntities);

for (const b of blockSummary.slice(0, 15)) {
  console.log(`\n  Block: ${b.name}  (${b.totalEntities} entities)`);
  const items = [...b.detail.entries()].sort((a, b) => b[1] - a[1]);
  for (const [k, v] of items.slice(0, 8)) {
    console.log(`    ${String(v).padStart(4)} ${k}`);
  }
}

console.log('\n=== TEXT/MTEXT samples by layer (first 30 chars) ===');
for (const [k, arr] of textSamples) {
  if (arr.length < 5) continue;
  console.log(`\n  ${k}  (${arr.length} entries shown)`);
  for (const t of arr.slice(0, 15)) console.log(`    ${t}`);
}

console.log('\n=== INSERT locations (placed block instances in model space) ===');
const insertCounts = new Map();
for (const ins of insertLocations) {
  insertCounts.set(ins.block, (insertCounts.get(ins.block) ?? 0) + 1);
}
for (const [b, c] of [...insertCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(c).padStart(4)}x ${b}`);
}

console.log('\n=== Bounding box of "C-PROP-LINE - SUB LOTS" entities ===');
for (const [k, ext] of layerExtents) {
  if (k.includes('SUB LOTS')) {
    console.log(`  ${k}`);
    console.log(`    extent: (${ext.minX.toFixed(1)}, ${ext.minY.toFixed(1)}) → (${ext.maxX.toFixed(1)}, ${ext.maxY.toFixed(1)})`);
    console.log(`    size:   ${(ext.maxX - ext.minX).toFixed(1)} × ${(ext.maxY - ext.minY).toFixed(1)}`);
    console.log(`    points sampled: ${ext.count}`);
  }
}
