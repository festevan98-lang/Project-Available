'use client';

import { X } from 'lucide-react';
import type { Lot } from '@/lib/supabase/types';

const STATUS_LABEL: Record<Lot['status'], string> = {
  available: 'Available',
  reserved: 'Reserved',
  under_contract: 'Under contract',
  sold: 'Sold',
};

interface Props {
  lot: Lot;
  onClose: () => void;
  onViewDetails: () => void;
}

export function LotPopover({ lot, onClose, onViewDetails }: Props) {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[88%] max-w-[300px] bg-ink-900/95 border border-brass-500/40 rounded-sm p-4 backdrop-blur-sm shadow-2xl">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-display text-xl text-brass-300">
          Lot {lot.lot_number}
        </h4>
        <button
          onClick={onClose}
          className="text-ink-300 hover:text-ink-50 -mt-1 -mr-1"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="border-t border-brass-500/20 pt-3 space-y-2 text-sm">
        <Row label="Status" value={STATUS_LABEL[lot.status]} accent />
        {lot.price && (
          <Row label="Price" value={`$${lot.price.toLocaleString()}`} />
        )}
        {lot.size_sqft && (
          <Row label="Sq Ft" value={lot.size_sqft.toLocaleString()} />
        )}
        {lot.dimensions && <Row label="Dimensions" value={lot.dimensions} />}
      </div>
      <button
        onClick={onViewDetails}
        className="mt-4 w-full bg-brass-500 hover:bg-brass-400 text-ink-950 font-medium py-2 rounded-sm text-sm transition"
      >
        View details
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-ink-400">{label}:</span>
      <span className={accent ? 'text-brass-300 font-medium' : 'text-ink-100'}>
        {value}
      </span>
    </div>
  );
}
