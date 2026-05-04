'use client';

import type { LotStatus } from '@/lib/supabase/types';

export interface LotFilterState {
  status: LotStatus | 'all';
  phase: string;
  minSize?: number;
  maxSize?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface Props {
  filters: LotFilterState;
  onChange: (next: LotFilterState) => void;
  phases: string[];
  matchingCount: number;
  totalCount: number;
}

const STATUS_OPTIONS: { value: LotFilterState['status']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'under_contract', label: 'Under contract' },
  { value: 'sold', label: 'Sold' },
];

export function LotFilters({
  filters,
  onChange,
  phases,
  matchingCount,
  totalCount,
}: Props) {
  return (
    <div className="border border-ink-700/50 bg-ink-900/40 rounded-sm p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as LotFilterState['status'],
              })
            }
            className="bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {phases.length > 1 && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">
              Phase
            </label>
            <select
              value={filters.phase}
              onChange={(e) =>
                onChange({ ...filters, phase: e.target.value })
              }
              className="bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
            >
              <option value="all">All phases</option>
              {phases.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">
            Min size (sqft)
          </label>
          <input
            type="number"
            value={filters.minSize ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                minSize: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="0"
            className="bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm w-28 focus:border-brass-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">
            Max price ($)
          </label>
          <input
            type="number"
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="No max"
            className="bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm w-32 focus:border-brass-500 focus:outline-none"
          />
        </div>

        <div className="ml-auto text-sm text-ink-300">
          <span className="text-brass-300 font-medium">{matchingCount}</span>
          {' '}of {totalCount} lots
        </div>
      </div>
    </div>
  );
}
