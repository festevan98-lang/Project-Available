'use client';

import { useState, useMemo } from 'react';
import type { Lot, LotStatus } from '@/lib/supabase/types';
import { LotDetailPanel } from './LotDetailPanel';
import { LotFilters, type LotFilterState } from './LotFilters';
import { LotPopover } from './LotPopover';

const STATUS_FILL: Record<LotStatus, string> = {
  available: 'rgba(217, 164, 55, 0.7)',
  reserved: 'rgba(217, 164, 55, 0.28)',
  under_contract: 'rgba(120, 84, 32, 0.55)',
  sold: 'rgba(80, 78, 70, 0.4)',
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

function polygonCentroid(points: string): { x: number; y: number } {
  const pairs = points.trim().split(/\s+/).map((p) => {
    const [x, y] = p.split(',').map(Number);
    return { x, y };
  });
  const cx = pairs.reduce((s, p) => s + p.x, 0) / pairs.length;
  const cy = pairs.reduce((s, p) => s + p.y, 0) / pairs.length;
  return { x: cx, y: cy };
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
  const [popoverLot, setPopoverLot] = useState<Lot | null>(null);
  const [detailLot, setDetailLot] = useState<Lot | null>(null);
  const [filters, setFilters] = useState<LotFilterState>({
    status: 'all',
    phase: 'all',
    minSize: undefined,
    maxSize: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const phases = useMemo(() => {
    const set = new Set<string>();
    lots.forEach((l) => l.phase && set.add(l.phase));
    return Array.from(set);
  }, [lots]);

  const matchingCount = lots.filter((l) => lotMatchesFilter(l, filters)).length;

  const statusCounts = useMemo(() => {
    return lots.reduce(
      (acc, l) => {
        acc[l.status] += 1;
        return acc;
      },
      { available: 0, reserved: 0, under_contract: 0, sold: 0 } as Record<
        LotStatus,
        number
      >
    );
  }, [lots]);

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
        className="relative w-full bg-ink-900/60 border border-ink-700/50 rounded-sm overflow-hidden touch-manipulation"
        style={{ aspectRatio: `${platWidth} / ${platHeight}` }}
      >
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-ink-950/75 backdrop-blur-sm border border-ink-700/60 rounded-sm px-2.5 sm:px-3 py-1.5 sm:py-2 max-w-[calc(100%-1rem)]">
          <CountDot status="available" count={statusCounts.available} />
          <CountDot status="reserved" count={statusCounts.reserved} />
          <CountDot status="under_contract" count={statusCounts.under_contract} />
          <CountDot status="sold" count={statusCounts.sold} />
        </div>

        {platImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={platImageUrl}
            alt={`${projectName} plat`}
            className="absolute inset-0 w-full h-full object-contain opacity-25"
          />
        )}

        <svg
          viewBox={`0 0 ${platWidth} ${platHeight}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {lots.map((lot) => {
            const matches = lotMatchesFilter(lot, filters);
            const isSelected = popoverLot?.id === lot.id;
            const clickable = lot.status !== 'sold';
            const centroid = polygonCentroid(lot.polygon_points);

            return (
              <g key={lot.id}>
                <polygon
                  points={lot.polygon_points}
                  fill={STATUS_FILL[lot.status]}
                  stroke={isSelected ? '#f8ecc8' : STATUS_STROKE[lot.status]}
                  strokeWidth={isSelected ? 3 : 2}
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : -1}
                  aria-label={clickable ? `Lot ${lot.lot_number}, ${lot.status}` : undefined}
                  style={{
                    opacity: matches ? 1 : 0.18,
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'opacity 200ms, stroke 150ms, stroke-width 150ms',
                    outline: 'none',
                  }}
                  onClick={() => clickable && setPopoverLot(lot)}
                  onKeyDown={(e) => {
                    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setPopoverLot(lot);
                    }
                  }}
                />
                <text
                  x={centroid.x}
                  y={centroid.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#0d0c08"
                  fontSize={Math.max(10, platWidth / 80)}
                  fontWeight={500}
                  style={{ pointerEvents: 'none', opacity: matches ? 0.8 : 0.2 }}
                >
                  {lot.lot_number}
                </text>
              </g>
            );
          })}
        </svg>

        {popoverLot && (
          <LotPopover
            lot={popoverLot}
            onClose={() => setPopoverLot(null)}
            onViewDetails={() => {
              setDetailLot(popoverLot);
              setPopoverLot(null);
            }}
          />
        )}
      </div>

      <Legend />

      {detailLot && (
        <LotDetailPanel
          lot={detailLot}
          onClose={() => setDetailLot(null)}
          onInterest={() => {
            onInterest(detailLot);
            setDetailLot(null);
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

function CountDot({ status, count }: { status: LotStatus; count: number }) {
  return (
    <span className="flex items-center gap-1.5 text-sm">
      <span
        className="w-2.5 h-2.5 rounded-full border"
        style={{
          background: STATUS_FILL[status],
          borderColor: STATUS_STROKE[status],
        }}
      />
      <span className="text-ink-100 font-medium tabular-nums">{count}</span>
    </span>
  );
}
