import DxfParser from 'dxf-parser';
import { LAYER_PALETTE } from './colors';
import type {
  DxfEntity,
  LayerSummary,
  ParsedDxf,
  DxfBBox,
} from './types';

export function unitsLabel(n: number): string {
  switch (n) {
    case 1: return 'inches';
    case 2: return 'feet';
    case 4: return 'mm';
    case 5: return 'cm';
    case 6: return 'm';
    default: return 'unspecified units';
  }
}

const SUPPORTED = new Set([
  'LINE', 'LWPOLYLINE', 'POLYLINE', 'ARC', 'CIRCLE', 'TEXT', 'MTEXT',
]);

function cleanText(raw: string): string {
  return raw
    .replace(/\\[A-Za-z]+\d*(?:\.\d+)?[xoX]?;?/g, '')
    .replace(/\\[fF][^;|]*\|[^;]*;/g, '')
    .replace(/\\[CWHQK][^;]*;/g, '')
    .replace(/\\[Pp]/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/%%[Pp]/g, '+/-')
    .replace(/%%[Cc]/g, 'dia')
    .replace(/%%[Dd]/g, ' deg')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseDxf(text: string): ParsedDxf {
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);
  if (!dxf) throw new Error('DXF parser returned null');

  const entities: DxfEntity[] = [];
  const unsupportedCounts: Record<string, number> = {};

  function bumpUnsupported(type: string) {
    unsupportedCounts[type] = (unsupportedCounts[type] ?? 0) + 1;
  }

  for (const e of dxf.entities ?? []) {
    const layer = e.layer ?? '0';
    const t = e.type;

    if (!SUPPORTED.has(t)) {
      bumpUnsupported(t);
      continue;
    }

    if (t === 'LINE') {
      const v = (e as { vertices?: { x: number; y: number }[] }).vertices;
      if (!v?.[0] || !v?.[1]) continue;
      entities.push({
        type: 'line',
        layer,
        a: { x: v[0].x, y: v[0].y },
        b: { x: v[1].x, y: v[1].y },
      });
    } else if (t === 'LWPOLYLINE' || t === 'POLYLINE') {
      const v = (e as { vertices?: { x: number; y: number }[] }).vertices;
      if (!v || v.length < 2) continue;
      const points = v.map((p) => ({ x: p.x, y: p.y }));
      const closed = !!(e as { shape?: boolean; closed?: boolean }).shape
        || !!(e as { closed?: boolean }).closed;
      entities.push({ type: 'polyline', layer, points, closed });
    } else if (t === 'ARC') {
      const c = (e as { center?: { x: number; y: number } }).center;
      const r = (e as { radius?: number }).radius;
      const sa = (e as { startAngle?: number }).startAngle;
      const ea = (e as { endAngle?: number }).endAngle;
      if (!c || r == null || sa == null || ea == null) continue;
      entities.push({ type: 'arc', layer, cx: c.x, cy: c.y, r, startRad: sa, endRad: ea });
    } else if (t === 'CIRCLE') {
      const c = (e as { center?: { x: number; y: number } }).center;
      const r = (e as { radius?: number }).radius;
      if (!c || r == null) continue;
      entities.push({ type: 'circle', layer, cx: c.x, cy: c.y, r });
    } else if (t === 'TEXT' || t === 'MTEXT') {
      const pos =
        (e as { position?: { x: number; y: number } }).position
        ?? (e as { startPoint?: { x: number; y: number } }).startPoint;
      if (!pos) continue;
      const raw = ((e as { text?: string }).text ?? '').toString();
      const cleaned = cleanText(raw);
      if (!cleaned) continue;
      const h =
        (e as { textHeight?: number }).textHeight
        ?? (e as { height?: number }).height
        ?? 1;
      entities.push({ type: 'text', layer, pos: { x: pos.x, y: pos.y }, text: cleaned, height: h });
    }
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  function expand(x: number, y: number) {
    if (!isFinite(x) || !isFinite(y)) return;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  for (const e of entities) {
    if (e.type === 'line') { expand(e.a.x, e.a.y); expand(e.b.x, e.b.y); }
    else if (e.type === 'polyline') { for (const p of e.points) expand(p.x, p.y); }
    else if (e.type === 'arc' || e.type === 'circle') {
      expand(e.cx - e.r, e.cy - e.r);
      expand(e.cx + e.r, e.cy + e.r);
    } else if (e.type === 'text') {
      expand(e.pos.x, e.pos.y);
    }
  }
  const bbox: DxfBBox = isFinite(minX)
    ? { minX, minY, maxX, maxY }
    : { minX: 0, minY: 0, maxX: 100, maxY: 100 };

  const layerCounts = new Map<string, number>();
  for (const e of entities) layerCounts.set(e.layer, (layerCounts.get(e.layer) ?? 0) + 1);
  const sortedNames = [...layerCounts.keys()].sort((a, b) => {
    const ca = layerCounts.get(a) ?? 0;
    const cb = layerCounts.get(b) ?? 0;
    if (ca !== cb) return cb - ca;
    return a.localeCompare(b);
  });
  const layers: LayerSummary[] = sortedNames.map((name, i) => ({
    name,
    count: layerCounts.get(name) ?? 0,
    color: LAYER_PALETTE[i % LAYER_PALETTE.length],
  }));

  const units = Number(
    (dxf as { header?: { $INSUNITS?: number } }).header?.$INSUNITS ?? 0
  );

  return {
    entities,
    layers,
    bbox,
    units,
    unitsLabel: unitsLabel(units),
    unsupportedCounts,
    totalEntities: entities.length,
  };
}

export function buildAnalysisDigest(parsed: ParsedDxf): string {
  const w = parsed.bbox.maxX - parsed.bbox.minX;
  const h = parsed.bbox.maxY - parsed.bbox.minY;
  const u = parsed.unitsLabel;

  const counts: Record<string, number> = {};
  for (const e of parsed.entities) counts[e.type] = (counts[e.type] ?? 0) + 1;

  let closedPolys = 0;
  for (const e of parsed.entities) {
    if (e.type === 'polyline' && e.closed) closedPolys++;
  }

  const texts = parsed.entities.filter((e) => e.type === 'text');
  const sampledLabels = texts
    .slice(0, 60)
    .map((t) => (t.type === 'text' ? t.text : ''))
    .filter((s) => s.length > 0)
    .map((s) => s.slice(0, 80));

  let digest = 'DXF DIGEST\n\n';
  digest += `Units (DXF $INSUNITS): ${parsed.units} (${u})\n`;
  digest += `Bounding box: ${w.toFixed(1)} x ${h.toFixed(1)} ${u}\n`;
  digest += `Total entities rendered: ${parsed.totalEntities}\n\n`;

  digest += 'Entity counts:\n';
  for (const [k, v] of Object.entries(counts)) digest += `  ${k}: ${v}\n`;
  digest += `  closed polylines: ${closedPolys}\n`;

  const unsupportedKeys = Object.keys(parsed.unsupportedCounts);
  if (unsupportedKeys.length) {
    digest += '\nUnsupported (counted, not rendered):\n';
    for (const k of unsupportedKeys) digest += `  ${k}: ${parsed.unsupportedCounts[k]}\n`;
  }

  digest += `\nLayers (${parsed.layers.length}, sorted by count):\n`;
  for (const l of parsed.layers.slice(0, 40)) digest += `  ${l.name} - ${l.count} entities\n`;
  if (parsed.layers.length > 40) digest += `  ...and ${parsed.layers.length - 40} more\n`;

  if (sampledLabels.length) {
    digest += `\nSampled text labels (${sampledLabels.length} of ${texts.length}):\n`;
    for (const t of sampledLabels) digest += `  "${t}"\n`;
  }

  return digest;
}
