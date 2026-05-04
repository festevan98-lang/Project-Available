'use client';

import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
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
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-2xl">Available lots</h3>
        <span className="text-ink-400 text-sm">
          {available.length} available {available.length === 1 ? 'lot' : 'lots'}
        </span>
      </div>

      <ul className="border border-ink-700/50 rounded-sm divide-y divide-ink-700/40 bg-ink-900/40 overflow-hidden">
        {available.map((lot) => (
          <li key={lot.id}>
            <button
              onClick={() => onSelect(lot)}
              className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-ink-800/40 transition text-left"
            >
              <span className="font-medium text-ink-50 min-w-[64px]">
                Lot {lot.lot_number}
              </span>
              <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-300">
                <span
                  className={`w-2 h-2 rounded-full ${STATUS_DOT[lot.status]}`}
                />
                {STATUS_LABEL[lot.status]}
              </span>
              <span className="ml-auto text-brass-300 font-medium">
                {lot.price ? `$${lot.price.toLocaleString()}` : '—'}
              </span>
              <ChevronRight className="w-4 h-4 text-ink-500" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
