'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Lot, LotStatus } from '@/lib/supabase/types';

const STATUS_DOT: Record<LotStatus, string> = {
  available: 'bg-brass-400',
  reserved: 'bg-brass-700',
  under_contract: 'bg-ink-500',
  sold: 'bg-ink-600',
};

const STATUS_LABEL: Record<LotStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  under_contract: 'Under contract',
  sold: 'Sold',
};

export function AvailableLotsGrid({
  lots,
  onSelect,
}: {
  lots: Lot[];
  onSelect: (lot: Lot) => void;
}) {
  const available = useMemo(
    () => lots.filter((l) => l.status === 'available'),
    [lots]
  );

  if (available.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-display text-2xl">Available Lots</h3>
        <span className="text-ink-400 text-sm">
          {available.length} available {available.length === 1 ? 'lot' : 'lots'}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {available.map((lot) => (
          <article
            key={lot.id}
            className="border border-ink-700/50 bg-ink-900/40 rounded-md p-5"
          >
            <header className="flex items-center justify-between mb-4">
              <h4 className="font-display text-xl">Lot {lot.lot_number}</h4>
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-ink-300">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[lot.status]}`} />
                {STATUS_LABEL[lot.status]}
              </span>
            </header>

            <div className="flex items-end justify-between gap-4">
              <dl className="text-sm space-y-1.5 flex-1">
                {lot.price && (
                  <Row label="Price" value={`$${lot.price.toLocaleString()}`} />
                )}
                {lot.size_sqft && (
                  <Row label="Sq Ft" value={lot.size_sqft.toLocaleString()} />
                )}
                {lot.dimensions && (
                  <Row label="Dimensions" value={lot.dimensions} />
                )}
                {lot.phase && <Row label="Phase" value={lot.phase} />}
              </dl>

              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                {lot.price && (
                  <span className="font-display text-2xl text-brass-300 leading-none">
                    ${lot.price.toLocaleString()}
                  </span>
                )}
                <button
                  onClick={() => onSelect(lot)}
                  className="inline-flex items-center gap-1.5 bg-brass-500 hover:bg-brass-400 text-ink-950 font-medium px-4 py-2 rounded-sm text-sm transition"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-ink-400 min-w-[88px]">{label}:</dt>
      <dd className="text-ink-50 font-medium">{value}</dd>
    </div>
  );
}
