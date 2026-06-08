'use client';

import { Eye, EyeOff } from 'lucide-react';
import type { LayerSummary } from '@/lib/dxf/types';

interface Props {
  layers: LayerSummary[];
  hiddenLayers: Set<string>;
  onToggle: (name: string) => void;
}

export function LayerChips({ layers, hiddenLayers, onToggle }: Props) {
  if (!layers.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {layers.map((l) => {
        const hidden = hiddenLayers.has(l.name);
        return (
          <button
            type="button"
            key={l.name}
            onClick={() => onToggle(l.name)}
            aria-pressed={!hidden}
            title={`${l.count} entities`}
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-sm border text-xs transition ${
              hidden
                ? 'border-ink-700/60 bg-ink-950 text-ink-400'
                : 'border-ink-700/60 bg-ink-900/60 text-ink-100 hover:border-brass-500/50'
            }`}
          >
            <span
              aria-hidden
              className="block w-2.5 h-2.5 rounded-full"
              style={{ background: hidden ? '#3a3830' : l.color, opacity: hidden ? 0.4 : 1 }}
            />
            <span className={hidden ? 'line-through' : ''}>{l.name}</span>
            <span className="text-ink-400 tabular-nums">{l.count}</span>
            {hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );
}
