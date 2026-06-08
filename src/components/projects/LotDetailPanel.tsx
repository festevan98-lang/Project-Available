'use client';

import { useEffect, useRef } from 'react';
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const canReserve = lot.status === 'available' || lot.status === 'reserved';

  useEffect(() => {
    document.body.classList.add('scroll-lock');
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('scroll-lock');
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 bg-ink-950/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Lot ${lot.lot_number} details`}
        className="fixed bottom-0 right-0 left-0 sm:left-auto sm:top-0 sm:bottom-0 sm:w-[420px] z-50 bg-ink-900 border-t sm:border-t-0 sm:border-l border-brass-500/30 max-h-[85dvh] sm:max-h-none overflow-y-auto rounded-t-lg sm:rounded-none [padding-bottom:max(env(safe-area-inset-bottom),16px)]"
      >
        <div aria-hidden className="sm:hidden flex justify-center pt-3 pb-1">
          <span className="block w-10 h-1 rounded-full bg-ink-400/40" />
        </div>

        <div className="p-5 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-brass-400 uppercase tracking-[0.22em] text-xs mb-2">
                Lot detail
              </p>
              <h3 className="font-display text-3xl">Lot {lot.lot_number}</h3>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              className="-m-2 p-2 text-ink-300 hover:text-ink-50 transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-brass-400 uppercase tracking-[0.22em] text-xs mb-3">
            Lot details
          </p>
          <div className="border-t border-brass-500/30 pt-4 flex flex-wrap gap-2 mb-6">
            <Chip label="Lot" value={`#${lot.lot_number}`} />
            <Chip label="Status" value={STATUS_LABELS[lot.status]} accent />
            {lot.phase && <Chip label="Phase" value={lot.phase} />}
            {lot.price && (
              <Chip label="Price" value={`$${lot.price.toLocaleString()}`} />
            )}
            {lot.size_sqft && (
              <Chip label="Sq Ft" value={lot.size_sqft.toLocaleString()} />
            )}
            {lot.dimensions && <Chip label="Dimensions" value={lot.dimensions} />}
          </div>

          {lot.notes && (
            <div className="text-sm text-ink-200 mb-6">
              <p className="text-ink-400 text-xs uppercase tracking-wider mb-1">
                Notes
              </p>
              {lot.notes}
            </div>
          )}

          <div className="space-y-3">
            {canReserve ? (
              <button
                onClick={onInterest}
                className="w-full bg-brass-500 hover:bg-brass-400 active:bg-brass-600 text-ink-950 font-medium py-3.5 px-5 rounded-sm transition min-h-[48px]"
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
        </div>
      </aside>
    </>
  );
}

function Chip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-baseline gap-2 border rounded-sm px-3 py-1.5 text-xs ${
        accent
          ? 'border-brass-500/50 bg-brass-900/15'
          : 'border-ink-700/60 bg-ink-900/40'
      }`}
    >
      <span className="uppercase tracking-wider text-ink-400">{label}</span>
      <span
        className={
          accent
            ? 'text-brass-300 font-medium text-sm'
            : 'text-ink-100 font-medium text-sm'
        }
      >
        {value}
      </span>
    </span>
  );
}
