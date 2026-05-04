'use client';

import { X } from 'lucide-react';
import type { Lot } from '@/lib/supabase/types';

const STATUS_LABELS: Record<Lot['status'], string> = {
  available: 'Available',
  reserved: 'Reserved',
  under_contract: 'Under contract',
  sold: 'Sold',
};

interface Props {
  lot: Lot;
  onClose: () => void;
  onInterest: () => void;
}

export function LotDetailPanel({ lot, onClose, onInterest }: Props) {
  const canReserve =
    lot.status === 'available' || lot.status === 'reserved';

  return (
    <>
      <div
        className="fixed inset-0 bg-ink-950/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className="fixed bottom-0 right-0 left-0 sm:left-auto sm:top-0 sm:bottom-0 sm:w-[420px] z-50 bg-ink-900 border-t sm:border-t-0 sm:border-l border-brass-500/30 p-6 sm:p-8 overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-brass-400 uppercase tracking-[0.2em] text-xs mb-2">
              Lot detail
            </p>
            <h3 className="font-display text-3xl">Lot {lot.lot_number}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-300 hover:text-ink-50 transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <dl className="space-y-3 text-sm border-t border-ink-700/50 pt-4">
          <Row label="Status" value={STATUS_LABELS[lot.status]} accent />
          {lot.phase && <Row label="Phase" value={lot.phase} />}
          {lot.size_sqft && (
            <Row
              label="Size"
              value={`${lot.size_sqft.toLocaleString()} sqft`}
            />
          )}
          {lot.price && (
            <Row label="Price" value={`$${lot.price.toLocaleString()}`} />
          )}
          {lot.notes && <Row label="Notes" value={lot.notes} />}
        </dl>

        <div className="mt-8 space-y-3">
          {canReserve ? (
            <button
              onClick={onInterest}
              className="w-full bg-brass-500 hover:bg-brass-400 text-ink-950 font-medium py-3 px-5 rounded-sm transition"
            >
              {lot.status === 'available'
                ? 'Reserve interest'
                : 'Join waitlist for this lot'}
            </button>
          ) : (
            <div className="w-full bg-ink-700/40 text-ink-300 text-center py-3 px-5 rounded-sm text-sm">
              This lot is not available
            </div>
          )}
          <p className="text-xs text-ink-400 text-center">
            Reservation is non-binding interest capture. Final terms set during
            contract.
          </p>
        </div>
      </aside>
    </>
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
    <div className="flex justify-between gap-4">
      <dt className="text-ink-400">{label}</dt>
      <dd className={accent ? 'text-brass-300 font-medium' : 'text-ink-100'}>
        {value}
      </dd>
    </div>
  );
}
