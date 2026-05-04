'use client';

import { useState, useRef, useMemo } from 'react';
import type { Lot, LotStatus } from '@/lib/supabase/types';
import { LotDetailPanel } from './LotDetailPanel';
import { LotFilters, type LotFilterState } from './LotFilters';

const STATUS_FILL: Record<LotStatus, string> = {
  available: 'rgba(217, 164, 55, 0.55)',
  reserved: 'rgba(217, 164, 55, 0.25)',
  under_contract: 'rgba(120, 84, 32, 0.55)',
  sold: 'rgba(80, 78, 70, 0.45)',
};

const STATUS_STROKE: Record<LotStatus, string> = {
  available: '#d9a437',
  reserved: '#9c6e22',
  under_contract: '#785420',
  sold: '#52503f',
};

function lotMatchesFilter(lot: Lot, f: LotFilterState): boolean {
  if (f.status !== 'all' && lot.status !== f.status) return false;
  if (f.phase !== 'all' && lot.phase !== f.phase) return false;
  if (lot.size_sqft != null) {
    if (f.minSize && lot.size_sqft < f.minSize) return false;
    if (f.maxSize && lot.size_sqft > f.maxSize) return false;
  }
  if (lot.price != null) {
    if (f.minPrice && lot.price < f.minPrice) return false;
    if (f.maxPrice && lot.price > f.maxPrice) return false;
  }
  return true;
}

interface Props {
  projectName: string;
  platImageUrl: string | null;
  platWidth: number;
  platHeight: number;
  lots: Lot[];
  onInterest: (lot: Lot) => void;
}

export function LotMap({
  projectName,
  platImageUrl,
  platWidth,
  platHeight,
  lots,
  onInterest,
}: Props) {
  const [selected, setSelected] = useState<Lot | null>(null);
  const [hovered, setHovered] = useState<Lot | null>(null);
  const [filters, setFilters] = useState<LotFilterState>({
    status: 'all',
    phase: 'all',
    minSize: undefined,
    maxSize: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const phases = useMemo(() => {
    const set = new Set<string>();
    lots.forEach((l) => l.phase && set.add(l.phase));
    return Array.from(set);
  }, [lots]);

  const matchingCount = lots.filter((l) => lotMatchesFilter(l, filters)).length;

  return (
    <div className="space-y-4">
      <LotFilters
        filters={filters}
        onChange={setFilters}
        phases={phases}
        matchingCount={matchingCount}
        totalCount={lots.length}
      />

      <div
        ref={containerRef}
        className="relative w-full bg-ink-900 border border-ink-700/50 rounded-sm overflow-hidden"
        style={{ aspectRatio: `${platWidth} / ${platHeight}` }}
      >
        {platImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={platImageUrl}
            alt={`${projectName} plat`}
            className="absolute inset-0 w-full h-full object-contain opacity-90"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-400 text-sm">
            Plat image not yet uploaded
          </div>
        )}

        <svg
          viewBox={`0 0 ${platWidth} ${platHeight}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {lots.map((lot) => {
            const matches = lotMatchesFilter(lot, filters);
            const isSelected = selected?.id === lot.id;
            const isHovered = hovered?.id === lot.id;
            const clickable = lot.status !== 'sold';

            return (
              <g key={lot.id}>
                <polygon
                  points={lot.polygon_points}
                  fill={STATUS_FILL[lot.status]}
                  stroke={
                    isSelected || isHovered
                      ? '#f8ecc8'
                      : STATUS_STROKE[lot.status]
                  }
                  strokeWidth={isSelected || isHovered ? 3 : 1.5}
                  style={{
                    opacity: matches ? 1 : 0.18,
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'opacity 200ms, stroke 150ms, stroke-width 150ms',
                  }}
                  onClick={() => clickable && setSelected(lot)}
                  onMouseEnter={() => setHovered(lot)}
                  onMouseLeave={() => setHovered(null)}
                />
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div className="absolute top-3 left-3 bg-ink-950/95 border border-brass-500/40 px-3 py-2 rounded-sm text-sm pointer-events-none">
            <span className="font-medium text-brass-300">
              Lot {hovered.lot_number}
            </span>
            <span className="text-ink-300 ml-3 capitalize">
              {hovered.status.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <Legend />

      {selected && (
        <LotDetailPanel
          lot={selected}
          onClose={() => setSelected(null)}
          onInterest={() => {
            onInterest(selected);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function Legend() {
  const items: { label: string; status: LotStatus }[] = [
    { label: 'Available', status: 'available' },
    { label: 'Reserved', status: 'reserved' },
    { label: 'Under Contract', status: 'under_contract' },
    { label: 'Sold', status: 'sold' },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-xs text-ink-300">
      {items.map((i) => (
        <div key={i.status} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm border"
            style={{
              background: STATUS_FILL[i.status],
              borderColor: STATUS_STROKE[i.status],
            }}
          />
          {i.label}
        </div>
      ))}
    </div>
  );
}
