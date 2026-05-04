'use client';

import { useMemo } from 'react';
import type { Lot } from '@/lib/supabase/types';

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
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-2xl">Available lots</h3>
        <span className="text-ink-400 text-sm">
          {available.length} of {lots.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {available.map((lot) => (
          <button
            key={lot.id}
            onClick={() => onSelect(lot)}
            className="text-left border border-ink-700/50 bg-ink-900/40 hover:border-brass-500/60 rounded-sm p-3 transition"
          >
            <div className="font-medium text-ink-50 mb-1">
              Lot {lot.lot_number}
            </div>
            <div className="text-xs text-ink-300 space-y-0.5">
              {lot.size_sqft && (
                <div>{lot.size_sqft.toLocaleString()} sqft</div>
              )}
              {lot.price && (
                <div className="text-brass-300">
                  ${lot.price.toLocaleString()}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
