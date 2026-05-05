'use client';

import { X, MapPin } from 'lucide-react';
import type { Lot } from '@/lib/supabase/types';

const STATUS_LABEL: Record<Lot['status'], string> = {
  available: 'Available',
  reserved: 'Reserved',
  under_contract: 'Under contract',
  sold: 'Sold',
};

const STATUS_PILL: Record<Lot['status'], string> = {
  available: 'text-brass-300 bg-brass-500/15 border-brass-500/40',
  reserved: 'text-brass-300/70 bg-brass-500/10 border-brass-500/30',
  under_contract: 'text-ink-200 bg-ink-700/40 border-ink-600/50',
  sold: 'text-ink-300 bg-ink-700/40 border-ink-600/50',
};

interface Props {
  lot: Lot;
  onClose: () => void;
  onViewDetails: () => void;
}

export function LotPopover({ lot, onClose, onViewDetails }: Props) {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[88%] max-w-[300px] bg-ink-900/95 border border-ink-600/60 rounded-md p-4 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center gap-3 mb-3">
        <MapPin className="w-4 h-4 text-brass-400 flex-shrink-0" />
        <h4 className="font-display text-lg leading-none flex-1">
          Lot {lot.lot_number}
        </h4>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border ${STATUS_PILL[lot.status]}`}
        >
          {STATUS_LABEL[lot.status]}
        </span>
        <button
          onClick={onClose}
          className="ml-1 w-6 h-6 rounded-full bg-ink-800 hover:bg-ink-700 flex items-center justify-center text-ink-300 hover:text-ink-50 transition flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <dl className="space-y-1.5 text-sm border-t border-ink-700/60 pt-3">
        {lot.price && <Row label="Price" value={`$${lot.price.toLocaleString()}`} />}
        {lot.size_sqft && (
          <Row label="Size" value={`${lot.size_sqft.toLocaleString()} SqFt`} />
        )}
      </dl>
      <button
        onClick={onViewDetails}
        className="mt-4 w-full bg-brass-500 hover:bg-brass-400 text-ink-950 font-medium py-2 rounded-sm text-sm transition"
      >
        View details
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-400">{label}:</dt>
      <dd className="text-ink-50 font-medium">{value}</dd>
    </div>
  );
}
