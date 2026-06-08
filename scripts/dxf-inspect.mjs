import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const file = process.argv[2];
if (!file) {
  console.error('usage: node dxf-inspect.mjs <path-to-dxf>');
  process.exit(1);
}

const rl = createInterface({
  input: createReadStream(file, { encoding: 'utf8' }),
  crlfDelay: Infinity,
});

let inEntities = false;
let prevLine = null;
let currentEntity = null;
let currentLayer = null;
let captureNextLayer = false;
let captureNextFlag = false;
let isClosed = false;

const stats = new Map();

function bump(layer, type, closed) {
  const key = `${layer}\t${type}${closed ? ' (closed)' : ''}`;
  stats.set(key, (stats.get(key) ?? 0) + 1);
}

function flushEntity() {
  if (currentEntity && currentLayer) {
    bump(currentLayer, currentEntity, isClosed);
  }
  currentEntity = null;
  currentLayer = null;
  isClosed = false;
}

const ENTITY_TYPES = new Set([
  'LWPOLYLINE', 'POLYLINE', 'LINE', 'TEXT', 'MTEXT',
  'CIRCLE', 'ARC', 'ELLIPSE', 'INSERT', 'HATCH', 'POINT',
]);

for await (const raw of rl) {
  const line = raw.trim();

  if (line === 'SECTION') {
    inEntities = false;
  }
  if (prevLine === '2' && line === 'ENTITIES') {
    inEntities = true;
  }
  if (prevLine === '2' && line === 'ENDSEC') {
    inEntities = false;
  }

  if (inEntities) {
    if (prevLine === '0' && ENTITY_TYPES.has(line)) {
      flushEntity();
      currentEntity = line;
    } else if (prevLine === '0' && line === 'ENDSEC') {
      flushEntity();
    } else if (currentEntity) {
      if (prevLine === '8') {
        currentLayer = line;
      } else if (prevLine === '70' && currentEntity === 'LWPOLYLINE') {
        const flag = parseInt(line, 10);
        if (!isNaN(flag) && (flag & 1) === 1) isClosed = true;
      }
    }
  }

  prevLine = line;
}
flushEntity();

const rows = [...stats.entries()]
  .map(([k, v]) => {
    const [layer, type] = k.split('\t');
    return { layer, type, count: v };
  })
  .sort((a, b) => b.count - a.count);

console.log('Top 40 (layer, type, count):');
console.log('---------------------------------------------------');
for (const r of rows.slice(0, 40)) {
  console.log(`${String(r.count).padStart(6)}  ${r.type.padEnd(22)}  ${r.layer}`);
}

console.log('\nClosed LWPOLYLINEs by layer (lot candidates):');
console.log('---------------------------------------------------');
const closed = rows.filter((r) => r.type.includes('closed'));
for (const r of closed.slice(0, 20)) {
  console.log(`${String(r.count).padStart(6)}  ${r.layer}`);
}
