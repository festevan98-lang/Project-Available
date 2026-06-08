'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
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

const INITIAL_LIMIT = 12;

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
  const [showAll, setShowAll] = useState(false);

  if (available.length === 0) return null;

  const visible = showAll ? available : available.slice(0, INITIAL_LIMIT);
  const hidden = available.length - visible.length;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-display text-2xl sm:text-3xl">Available lots</h3>
        <span className="text-ink-400 text-sm">
          {available.length} available
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {visible.map((lot) => (
          <article
            key={lot.id}
            className="border border-ink-700/50 bg-ink-900/40 hover:border-brass-500/50 transition rounded-sm p-4 sm:p-5"
          >
            <header className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="font-display text-lg sm:text-xl">Lot {lot.lot_number}</h4>
              <span className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-wider text-ink-300">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[lot.status]}`} />
                {STATUS_LABEL[lot.status]}
              </span>
            </header>

            <div className="flex items-end justify-between gap-4">
              <dl className="text-sm space-y-1.5 flex-1 min-w-0">
                {lot.size_sqft && (
                  <Row label="Sq Ft" value={lot.size_sqft.toLocaleString()} />
                )}
                {lot.dimensions && (
                  <Row label="Dimensions" value={lot.dimensions} />
                )}
                {lot.phase && <Row label="Phase" value={lot.phase} />}
              </dl>

              <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
                {lot.price && (
                  <span className="font-display text-xl sm:text-2xl text-brass-300 leading-none tabular-nums">
                    ${lot.price.toLocaleString()}
                  </span>
                )}
                <button
                  onClick={() => onSelect(lot)}
                  className="inline-flex items-center gap-1.5 bg-brass-500 hover:bg-brass-400 active:bg-brass-600 text-ink-950 font-medium px-3 sm:px-4 py-2 rounded-sm text-xs sm:text-sm transition min-h-[40px]"
                >
                  View details
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 border border-ink-700/60 hover:border-brass-500/60 text-ink-200 hover:text-brass-300 px-4 py-3 rounded-sm transition min-h-[44px]"
        >
          Show all {available.length} available lots
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
      {showAll && available.length > INITIAL_LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 border border-ink-700/60 hover:border-ink-300 text-ink-300 hover:text-ink-100 px-4 py-3 rounded-sm transition text-sm"
        >
          Collapse
        </button>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-ink-400 text-xs sm:text-sm min-w-[64px] sm:min-w-[80px]">{label}</dt>
      <dd className="text-ink-50 font-medium truncate">{value}</dd>
    </div>
  );
}
