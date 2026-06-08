'use client';

import { useMemo, useRef, useState } from 'react';
import type { DxfEntity, ParsedDxf } from '@/lib/dxf/types';

interface Props {
  parsed: ParsedDxf;
  hiddenLayers: Set<string>;
  height?: number;
}

export function DxfPreview({ parsed, hiddenLayers, height = 560 }: Props) {
  const { bbox, entities, layers } = parsed;

  const colorByLayer = useMemo(
    () => new Map(layers.map((l) => [l.name, l.color])),
    [layers]
  );

  const w = bbox.maxX - bbox.minX || 1;
  const h = bbox.maxY - bbox.minY || 1;
  const padX = w * 0.05;
  const padY = h * 0.05;
  const vbX = bbox.minX - padX;
  const vbY = bbox.minY - padY;
  const vbW = w + 2 * padX;
  const vbH = h + 2 * padY;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; basePan: { x: number; y: number } } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function pixelDeltaToVbDelta(px: number, axis: 'x' | 'y'): number {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const ratio = axis === 'x' ? vbW / rect.width : vbH / rect.height;
    return px * ratio;
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((z) => Math.min(50, Math.max(0.05, z * (1 + delta))));
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, basePan: pan };
  }

  function onMouseMove(e: React.MouseEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dx = pixelDeltaToVbDelta(e.clientX - d.startX, 'x') / zoom;
    const dy = pixelDeltaToVbDelta(e.clientY - d.startY, 'y') / zoom;
    setPan({ x: d.basePan.x + dx, y: d.basePan.y + dy });
  }

  function onMouseUp() {
    dragRef.current = null;
  }

  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  const visible = useMemo(
    () => entities.filter((e) => !hiddenLayers.has(e.layer)),
    [entities, hiddenLayers]
  );

  const cy = (vbY * 2 + vbH);

  return (
    <div className="relative w-full bg-ink-950 border border-ink-700/50 rounded-sm overflow-hidden select-none">
      <svg
        ref={svgRef}
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full block"
        style={{ height, cursor: dragRef.current ? 'grabbing' : 'grab', touchAction: 'none' }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
          <g transform={`translate(0 ${cy}) scale(1 -1)`}>
            {visible.map((e, i) => (
              <RenderedEntity key={i} entity={e} stroke={colorByLayer.get(e.layer) ?? '#aaa'} />
            ))}
          </g>
        </g>
      </svg>

      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(50, z * 1.5))}
          className="bg-ink-950/80 border border-ink-700/60 hover:border-brass-500/60 text-ink-200 hover:text-brass-300 px-2 py-1 rounded-sm text-xs min-w-[28px]"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.05, z / 1.5))}
          className="bg-ink-950/80 border border-ink-700/60 hover:border-brass-500/60 text-ink-200 hover:text-brass-300 px-2 py-1 rounded-sm text-xs min-w-[28px]"
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          type="button"
          onClick={reset}
          className="bg-ink-950/80 border border-ink-700/60 hover:border-brass-500/60 text-ink-200 hover:text-brass-300 px-2 py-1 rounded-sm text-xs"
        >
          Fit
        </button>
      </div>
      <div className="absolute bottom-2 right-2 bg-ink-950/80 border border-ink-700/60 rounded-sm px-2 py-1 text-[11px] text-ink-300">
        Drag to pan / scroll to zoom / {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

function RenderedEntity({ entity, stroke }: { entity: DxfEntity; stroke: string }) {
  const common = { vectorEffect: 'non-scaling-stroke' as const };

  if (entity.type === 'line') {
    return (
      <line
        x1={entity.a.x}
        y1={entity.a.y}
        x2={entity.b.x}
        y2={entity.b.y}
        stroke={stroke}
        strokeWidth={1}
        fill="none"
        {...common}
      />
    );
  }

  if (entity.type === 'polyline') {
    const pts = entity.points.map((p) => `${p.x},${p.y}`).join(' ');
    if (entity.closed) {
      return (
        <polygon
          points={pts}
          stroke={stroke}
          strokeWidth={1}
          fill={stroke}
          fillOpacity={0.08}
          {...common}
        />
      );
    }
    return <polyline points={pts} stroke={stroke} strokeWidth={1} fill="none" {...common} />;
  }

  if (entity.type === 'circle') {
    return <circle cx={entity.cx} cy={entity.cy} r={entity.r} stroke={stroke} strokeWidth={1} fill="none" {...common} />;
  }

  if (entity.type === 'arc') {
    const startX = entity.cx + entity.r * Math.cos(entity.startRad);
    const startY = entity.cy + entity.r * Math.sin(entity.startRad);
    const endX = entity.cx + entity.r * Math.cos(entity.endRad);
    const endY = entity.cy + entity.r * Math.sin(entity.endRad);
    let sweep = entity.endRad - entity.startRad;
    while (sweep < 0) sweep += Math.PI * 2;
    const largeArc = sweep > Math.PI ? 1 : 0;
    return (
      <path
        d={`M ${startX} ${startY} A ${entity.r} ${entity.r} 0 ${largeArc} 0 ${endX} ${endY}`}
        stroke={stroke}
        strokeWidth={1}
        fill="none"
        {...common}
      />
    );
  }

  if (entity.type === 'text') {
    const fontSize = Math.max(entity.height, 1);
    return (
      <g transform={`translate(${entity.pos.x} ${entity.pos.y}) scale(1 -1)`}>
        <text x={0} y={0} fill={stroke} fontSize={fontSize} dominantBaseline="hanging">
          {entity.text.slice(0, 80)}
        </text>
      </g>
    );
  }

  return null;
}
